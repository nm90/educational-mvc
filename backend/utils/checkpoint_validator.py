"""
Code Checkpoint Validator - Hybrid static analysis and sandboxed execution.

MVC Role: UTILITY / Business Logic
- Validates student code submissions against checkpoint requirements
- Uses static analysis (AST, regex) for simple checks
- Uses sandboxed execution for behavioral validation
- Ensures security through whitelisting and timeout protection

Learning Purpose:
- Demonstrates safe code execution techniques
- Shows AST parsing for static analysis
- Illustrates timeout protection and sandboxing
- Educational tool for Lessons 3, 6, 7, 8

Design Notes:
- NEVER uses eval() or exec() on raw user code without sandboxing
- Whitelist approach for execution validators
- 5-second timeout protection
- Limited scope (no file I/O, network, subprocess)

Lesson Reference:
- Lesson 3: Static validation of email rules
- Lessons 6, 7, 8: Execution validation of features
"""

import ast
import re
import signal
from typing import Dict, List, Any, Optional
from backend.utils.decorators import log_method_call


class CheckpointValidator:
    """
    Validates code checkpoint submissions using static analysis or execution.

    Validation Types:
    1. Static Analysis:
       - Regex pattern matching
       - AST structure checking
       - String analysis for specific patterns

    2. Sandboxed Execution:
       - Compile and execute in restricted namespace
       - Test function outputs with predefined inputs
       - Timeout protection (5 seconds)
    """

    # Maximum execution time for code validation (seconds)
    EXECUTION_TIMEOUT = 5

    # Safe built-ins for sandboxed execution
    SAFE_BUILTINS = {
        'str': str,
        'int': int,
        'float': float,
        'bool': bool,
        'list': list,
        'dict': dict,
        'tuple': tuple,
        'set': set,
        'len': len,
        'range': range,
        'enumerate': enumerate,
        'zip': zip,
        'map': map,
        'filter': filter,
        'sorted': sorted,
        'sum': sum,
        'min': min,
        'max': max,
        'abs': abs,
        'round': round,
        'print': print,  # Allow for debugging
        'ValueError': ValueError,  # Needed for user code to raise
        'TypeError': TypeError,
        'KeyError': KeyError,
        'IndexError': IndexError,
    }

    @staticmethod
    @log_method_call
    def validate_checkpoint(
        lesson_id: int,
        checkpoint_id: str,
        submitted_code: str,
        checkpoint_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Main validation entry point - routes to appropriate validator.

        MVC Flow:
        1. Controller receives code submission
        2. Calls this method with validator config
        3. Route to static or execution validator
        4. Return detailed results for UI display
        5. Dev panel shows this method call with all details

        Args:
            lesson_id: Lesson ID (1-8)
            checkpoint_id: Unique checkpoint identifier
            submitted_code: Student's code submission
            checkpoint_config: Validator configuration from lesson JSON

        Returns:
            {
                'passed': bool,
                'message': str,
                'hints': [str] (optional),
                'errors': [str] (optional),
                'details': dict (optional debug info)
            }

        ✅ DO: Let Controller handle HTTP layer, return validation result
        ⚠️ DON'T: Raise exceptions - return error dict for user display
        """
        validator_type = checkpoint_config.get('type', 'static')

        if validator_type == 'static':
            return CheckpointValidator.validate_static(
                submitted_code,
                checkpoint_config.get('checks', [])
            )
        elif validator_type == 'execution':
            return CheckpointValidator.validate_execution(
                submitted_code,
                checkpoint_config.get('test_cases', []),
                checkpoint_config.get('function_name'),
                checkpoint_config.get('timeout', CheckpointValidator.EXECUTION_TIMEOUT)
            )
        else:
            return {
                'passed': False,
                'message': f'Unknown validator type: {validator_type}',
                'errors': [f'Validator type "{validator_type}" not supported']
            }

    @staticmethod
    @log_method_call
    def validate_static(
        submitted_code: str,
        checks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Static analysis validation using regex and AST.

        MVC Flow:
        1. Parse code to AST (validate syntax)
        2. Run each check (regex or AST node detection)
        3. Collect errors for required checks
        4. Collect hints for optional checks
        5. Return detailed results

        Args:
            submitted_code: Code to validate
            checks: List of check definitions:
                [
                    {
                        'type': 'regex',
                        'pattern': r'email\.endswith\(.*\.edu.*\)',
                        'message': 'Must check .edu domain',
                        'required': True
                    },
                    {
                        'type': 'ast_contains',
                        'node_type': 'Raise',
                        'message': 'Must raise ValueError',
                        'required': True
                    }
                ]

        Returns:
            Validation result dict with passed, message, errors, hints

        Safety:
        ✅ NO code execution - just regex and AST parsing
        ✅ Cannot harm system - syntax checking only
        ✅ Fast - no timeout needed

        Covered in: Lesson 3 (static code validation pattern)
        """
        errors = []
        hints = []

        # Parse AST for structure checks
        try:
            tree = ast.parse(submitted_code)
        except SyntaxError as e:
            return {
                'passed': False,
                'message': 'Syntax error in your code',
                'errors': [f'Line {e.lineno}: {e.msg}'],
                'hints': ['Check for missing colons, parentheses, or quotes']
            }

        # Run each check
        for check in checks:
            check_type = check.get('type', 'regex')
            required = check.get('required', True)
            message = check.get('message', 'Check failed')

            if check_type == 'regex':
                # Regex pattern matching
                pattern = check.get('pattern', '')
                if not re.search(pattern, submitted_code, re.MULTILINE):
                    if required:
                        errors.append(message)
                    else:
                        hints.append(message)

            elif check_type == 'ast_contains':
                # AST node type checking
                node_type = check.get('node_type')
                found = CheckpointValidator._ast_contains_node(tree, node_type)
                if not found:
                    if required:
                        errors.append(message)
                    else:
                        hints.append(message)

        # Determine if validation passed
        passed = len(errors) == 0

        return {
            'passed': passed,
            'message': 'All checks passed!' if passed else 'Some checks failed',
            'errors': errors if errors else None,
            'hints': hints if hints else None
        }

    @staticmethod
    def _ast_contains_node(tree: ast.AST, node_type: str) -> bool:
        """
        Check if AST contains a specific node type.

        Used for checking code structure (e.g., does it have a Raise node?)

        Args:
            tree: AST tree to search
            node_type: Name of AST node type (e.g., 'Raise', 'FunctionDef')

        Returns:
            True if node type found, False otherwise
        """
        for node in ast.walk(tree):
            if type(node).__name__ == node_type:
                return True
        return False

    @staticmethod
    @log_method_call
    def validate_execution(
        submitted_code: str,
        test_cases: List[Dict[str, Any]],
        function_name: str,
        timeout: int = 5
    ) -> Dict[str, Any]:
        """
        Sandboxed execution validation.

        MVC Flow:
        1. Parse code to AST (syntax check)
        2. Create restricted namespace (whitelist built-ins only)
        3. Set timeout handler
        4. Execute code in sandbox
        5. Extract and test function
        6. Verify outputs match expected results
        7. Return detailed results

        Args:
            submitted_code: Code to execute
            test_cases: Test cases with inputs and expected outputs:
                [
                    {
                        'input': {'status': 'done'},
                        'expected': 2,
                        'description': 'Filter by done status'
                    }
                ]
            function_name: Name of function to test
            timeout: Max execution time in seconds

        Returns:
            Validation result dict with passed, message, errors

        Security Measures:
        ✅ Whitelist built-ins - no dangerous imports
        ✅ Timeout protection - 5 second max (signal.alarm)
        ✅ No file I/O - cannot access filesystem
        ✅ No network - cannot make connections
        ✅ No subprocess - cannot run external programs
        ⚠️ Note: signal.alarm() is Linux/macOS only

        Example for Lesson 6:
        - Extract Task.by_status() function
        - Call with test data
        - Verify correct filtering

        Covered in: Lessons 6, 7, 8 (execution validation)
        """
        # Parse code to validate syntax
        try:
            tree = ast.parse(submitted_code)
        except SyntaxError as e:
            return {
                'passed': False,
                'message': 'Syntax error in your code',
                'errors': [f'Line {e.lineno}: {e.msg}']
            }

        # Create restricted globals namespace
        # ✅ DO: Use whitelist approach - only allow safe built-ins
        # ⚠️ DON'T: Use 'eval' or 'compile' with eval mode
        safe_globals = {
            '__builtins__': CheckpointValidator.SAFE_BUILTINS,
            '__name__': '__student_code__',
        }

        # Set up timeout handler
        def timeout_handler(signum, frame):
            raise TimeoutError(f"Code execution timed out after {timeout} seconds")

        # Execute code in sandbox
        try:
            # Install timeout handler
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(timeout)

            # Execute student code
            # ✅ Using compiled AST and restricted globals for safety
            exec(compile(tree, '<student_code>', 'exec'), safe_globals)

            # Extract the function
            if function_name not in safe_globals:
                return {
                    'passed': False,
                    'message': f'Function "{function_name}" not found in your code',
                    'errors': [f'Expected to find function: {function_name}']
                }

            student_function = safe_globals[function_name]

            # Run test cases
            failed_tests = []
            for i, test_case in enumerate(test_cases):
                try:
                    test_input = test_case.get('input', {})
                    expected = test_case.get('expected')
                    description = test_case.get('description', f'Test {i+1}')

                    # Call function with test input
                    result = student_function(**test_input)

                    # Check result
                    if result != expected:
                        failed_tests.append({
                            'description': description,
                            'expected': expected,
                            'actual': result
                        })
                except Exception as e:
                    failed_tests.append({
                        'description': test_case.get('description', f'Test {i+1}'),
                        'error': str(e)
                    })

            # Cancel timeout
            signal.alarm(0)

            # Return results
            if failed_tests:
                return {
                    'passed': False,
                    'message': f'{len(failed_tests)} test(s) failed',
                    'errors': [
                        f"{t['description']}: Expected {t.get('expected')}, got {t.get('actual', 'error: ' + t.get('error'))}"
                        for t in failed_tests
                    ]
                }
            else:
                return {
                    'passed': True,
                    'message': f'All {len(test_cases)} test(s) passed!'
                }

        except TimeoutError as e:
            signal.alarm(0)
            return {
                'passed': False,
                'message': 'Code execution timeout',
                'errors': [str(e)],
                'hints': ['Your code might have an infinite loop']
            }

        except Exception as e:
            signal.alarm(0)
            return {
                'passed': False,
                'message': 'Error executing your code',
                'errors': [str(e)]
            }

        finally:
            # Always cancel timeout
            signal.alarm(0)
