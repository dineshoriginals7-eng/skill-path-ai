"""Demo Data Engine
================
Provides realistic data and question banks across all 6 question types:
- MCQ
- Output Prediction
- Debugging
- Coding (with deterministic test cases)
- Conceptual (with transparent rubrics)
- Real-world Scenarios

Supports adaptive difficulty levels (beginner, intermediate, advanced)
and assessment modes (diagnostic, practice, mastery).
"""

import random
from typing import List, Dict, Any, Optional

DEMO_QUESTIONS_BANK: Dict[str, List[Dict[str, Any]]] = {
    "Python": [
        {
            "type": "mcq",
            "difficulty": "beginner",
            "question_text": "What is the output of `print(type([]))` in Python 3?",
            "options": [
                {"id": "a", "text": "<class 'list'>"},
                {"id": "b", "text": "<class 'tuple'>"},
                {"id": "c", "text": "<class 'array'>"},
                {"id": "d", "text": "None"},
            ],
            "correct_answer": "a",
            "explanation": "[] evaluates to a built-in mutable list instance, so type() returns <class 'list'>.",
            "tags": ["types", "basics", "collections"],
        },
        {
            "type": "output_prediction",
            "difficulty": "intermediate",
            "question_text": "Predict the output of the following mutable reference code:",
            "code_snippet": "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
            "options": [
                {"id": "a", "text": "[1, 2, 3]"},
                {"id": "b", "text": "[1, 2, 3, 4]"},
                {"id": "c", "text": "[4]"},
                {"id": "d", "text": "AttributeError"},
            ],
            "correct_answer": "b",
            "explanation": "Variables in Python store object references. 'y = x' does not copy the list; both symbols reference the exact same heap memory block.",
            "tags": ["mutability", "references", "memory"],
        },
        {
            "type": "debugging",
            "difficulty": "intermediate",
            "question_text": "Identify the bug in this function designed to accumulate items into a default list:",
            "code_snippet": "def append_item(val, target_list=[]):\n    target_list.append(val)\n    return target_list\n\nprint(append_item(1))\nprint(append_item(2))",
            "options": [
                {"id": "a", "text": "Default argument expressions are evaluated once when the function is defined, causing state retention across calls."},
                {"id": "b", "text": "append() does not return the updated list; it returns None."},
                {"id": "c", "text": "Integers cannot be appended directly to an empty list without casting."},
                {"id": "d", "text": "The function must declare target_list as global."},
            ],
            "correct_answer": "a",
            "explanation": "Default argument values are created when function definitions are executed, not each time they are invoked. Using mutable default arguments leads to shared state bugs. The fix is 'target_list=None'.",
            "tags": ["functions", "default_arguments", "gotchas"],
        },
        {
            "type": "coding",
            "difficulty": "intermediate",
            "question_text": "Implement a Python function `reverse_words(s: str) -> str` that reverses the order of words in a space-separated string without reversing the letters within each word.",
            "code_snippet": "def reverse_words(s: str) -> str:\n    # Write your solution here\n    pass",
            "correct_answer": "def reverse_words(s: str) -> str:\n    return ' '.join(s.strip().split()[::-1])",
            "test_cases": [
                {"input": "'the sky is blue'", "expected": "blue is sky the", "description": "Standard sentence"},
                {"input": "'  hello world  '", "expected": "world hello", "description": "Leading and trailing spaces"},
                {"input": "'a good   example'", "expected": "example good a", "description": "Multiple internal spaces"},
            ],
            "explanation": "Split the string into words using split() which collapses contiguous whitespace, reverse the resulting list with [::-1] or reversed(), and join back with ' '.",
            "tags": ["algorithms", "strings", "coding"],
        },
        {
            "type": "conceptual",
            "difficulty": "advanced",
            "question_text": "Explain the Python Global Interpreter Lock (GIL). What problem does it solve in CPython, and what are its implications for multi-threaded CPU-bound programs?",
            "options": None,
            "correct_answer": "The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes at once. In CPython it solves thread-safety issues with reference count memory management. For CPU-bound tasks, multi-threading yields no concurrency speedup; developers must use multiprocessing instead.",
            "rubric": [
                {"criterion": "Defines GIL as mutex preventing simultaneous bytecode execution in CPython", "weight": 0.4, "keywords": ["mutex", "thread", "bytecode", "cpython"]},
                {"criterion": "Explains reference counting / memory safety rationale", "weight": 0.3, "keywords": ["reference count", "memory", "safety"]},
                {"criterion": "Identifies CPU-bound bottleneck and multiprocessing alternative", "weight": 0.3, "keywords": ["cpu", "multiprocessing", "concurrency"]},
            ],
            "explanation": "CPython uses reference counting for garbage collection. Without the GIL, race conditions could corrupt reference counts.",
            "tags": ["gil", "concurrency", "runtime"],
        },
        {
            "type": "scenario",
            "difficulty": "advanced",
            "question_text": "Your production FastAPI backend experiences high memory usage that grows monotonically when processing large CSV uploads. What is the most effective architectural mitigation?",
            "options": [
                {"id": "a", "text": "Stream the file in chunks using UploadFile.read(chunk_size) or a generator instead of calling .read() all at once into RAM."},
                {"id": "b", "text": "Switch from FastAPI to synchronous Flask."},
                {"id": "c", "text": "Disable Python garbage collection with gc.disable()."},
                {"id": "d", "text": "Increase the Uvicorn worker count to 16."},
            ],
            "correct_answer": "a",
            "explanation": "Calling .read() buffers the entire file payload into heap memory. For large files, chunked streaming processes data with constant O(1) buffer overhead.",
            "tags": ["fastapi", "streaming", "production"],
        },
    ],
    "JavaScript": [
        {
            "type": "mcq",
            "difficulty": "beginner",
            "question_text": "Which declaration keyword creates a block-scoped variable that CANNOT be reassigned?",
            "options": [
                {"id": "a", "text": "var"},
                {"id": "b", "text": "let"},
                {"id": "c", "text": "const"},
                {"id": "d", "text": "static"},
            ],
            "correct_answer": "c",
            "explanation": "'const' binds an identifier in block scope and prohibits reassignment.",
            "tags": ["es6", "scoping", "variables"],
        },
        {
            "type": "output_prediction",
            "difficulty": "intermediate",
            "question_text": "What is the exact console output of the following asynchronous code snippet?",
            "code_snippet": "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
            "options": [
                {"id": "a", "text": "1, 2, 3, 4"},
                {"id": "b", "text": "1, 4, 2, 3"},
                {"id": "c", "text": "1, 4, 3, 2"},
                {"id": "d", "text": "1, 3, 4, 2"},
            ],
            "correct_answer": "c",
            "explanation": "Synchronous statements run first ('1', '4'). Next, the microtask queue (Promise.then -> '3') executes before the macrotask/task queue (setTimeout -> '2').",
            "tags": ["event_loop", "microtasks", "async"],
        },
        {
            "type": "debugging",
            "difficulty": "intermediate",
            "question_text": "Why does the following loop log '3, 3, 3' instead of '0, 1, 2'?",
            "code_snippet": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}",
            "options": [
                {"id": "a", "text": "'var' is function-scoped, so all callbacks share the single mutated binding. Replacing 'var' with 'let' creates a new binding per iteration."},
                {"id": "b", "text": "setTimeout is deprecated for loops; setImmediate must be used."},
                {"id": "c", "text": "The loop executes backwards in V8 optimization pipelines."},
                {"id": "d", "text": "console.log cannot read values within anonymous closures."},
            ],
            "correct_answer": "a",
            "explanation": "'var' hoists to function or global scope. When the callbacks fire after 100ms, 'i' equals 3. 'let' creates per-iteration block bindings.",
            "tags": ["closures", "scoping", "var_vs_let"],
        },
        {
            "type": "coding",
            "difficulty": "intermediate",
            "question_text": "Write a JavaScript function `flatten(arr)` that flattens a nested array of arbitrary depth into a single flat array.",
            "code_snippet": "function flatten(arr) {\n  // Implement flatten\n}",
            "correct_answer": "function flatten(arr) {\n  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);\n}",
            "test_cases": [
                {"input": "[1, [2, [3, [4]], 5]]", "expected": "[1, 2, 3, 4, 5]", "description": "Deeply nested array"},
                {"input": "[1, 2, 3]", "expected": "[1, 2, 3]", "description": "Already flat array"},
                {"input": "[]", "expected": "[]", "description": "Empty array"},
            ],
            "explanation": "Recursive reduction checks Array.isArray() on each element, concatenating flattened nested arrays or scalar elements into accumulator.",
            "tags": ["recursion", "arrays", "coding"],
        },
        {
            "type": "conceptual",
            "difficulty": "advanced",
            "question_text": "What is a JavaScript closure, and how does it enable lexical state encapsulation?",
            "options": None,
            "correct_answer": "A closure is the combination of a function bundled together with references to its surrounding lexical environment. Even after the outer function has executed and returned, the inner function retains access to outer variables.",
            "rubric": [
                {"criterion": "Defines closure as function bundled with lexical scope", "weight": 0.4, "keywords": ["function", "lexical", "scope", "environment"]},
                {"criterion": "Explains that outer variables persist after outer function returns", "weight": 0.3, "keywords": ["outer", "persists", "retains", "returned"]},
                {"criterion": "Mentions practical usage (data privacy, currying, callbacks)", "weight": 0.3, "keywords": ["encapsulation", "privacy", "callback", "state"]},
            ],
            "explanation": "Closures allow private state patterns without classes and are fundamental to hooks and higher-order functions.",
            "tags": ["closures", "lexical_scope", "encapsulation"],
        },
    ],
    "React": [
        {
            "type": "mcq",
            "difficulty": "beginner",
            "question_text": "Which React hook is designed for imperative side effects like API subscriptions and DOM mutations?",
            "options": [
                {"id": "a", "text": "useState"},
                {"id": "b", "text": "useEffect"},
                {"id": "c", "text": "useMemo"},
                {"id": "d", "text": "useCallback"},
            ],
            "correct_answer": "b",
            "explanation": "'useEffect' runs post-render to manage subscriptions, network calls, and cleanup routines.",
            "tags": ["hooks", "side_effects", "lifecycle"],
        },
        {
            "type": "output_prediction",
            "difficulty": "intermediate",
            "question_text": "In React 18 with automatic batching, how many re-renders occur when clicking this button?",
            "code_snippet": "function Counter() {\n  const [count, setCount] = useState(0);\n  const [flag, setFlag] = useState(false);\n  function handleClick() {\n    setCount(c => c + 1);\n    setFlag(f => !f);\n  }\n  return <button onClick={handleClick}>Increment</button>;\n}",
            "options": [
                {"id": "a", "text": "1 re-render (batched)"},
                {"id": "b", "text": "2 separate re-renders"},
                {"id": "c", "text": "0 re-renders"},
                {"id": "d", "text": "Continuous loop"},
            ],
            "correct_answer": "a",
            "explanation": "React 18 automatically batches state updates across event handlers, promises, timeouts, and native events into a single render pass.",
            "tags": ["react18", "batching", "rendering"],
        },
        {
            "type": "debugging",
            "difficulty": "advanced",
            "question_text": "What subtle performance and memory defect exists in this useEffect hook?",
            "code_snippet": "useEffect(() => {\n  const handleResize = () => setWidth(window.innerWidth);\n  window.addEventListener('resize', handleResize);\n}, []);",
            "options": [
                {"id": "a", "text": "Missing cleanup return function: window.removeEventListener is never called when unmounting, leaking listeners."},
                {"id": "b", "text": "The dependency array cannot be empty for window events."},
                {"id": "c", "text": "window.innerWidth is asynchronous."},
                {"id": "d", "text": "useEffect cannot read window global."},
            ],
            "correct_answer": "a",
            "explanation": "Subscribing to global event emitters requires returning a cleanup closure `() => window.removeEventListener('resize', handleResize)` to prevent memory leaks.",
            "tags": ["memory_leaks", "cleanups", "debugging"],
        },
        {
            "type": "scenario",
            "difficulty": "intermediate",
            "question_text": "You are rendering a list of 5,000 items that causes heavy lag during scroll. What is the standard React optimization pattern?",
            "options": [
                {"id": "a", "text": "Virtualize the list using react-window or tanstack-virtual to render only visible DOM nodes."},
                {"id": "b", "text": "Wrap every row in React.memo with inline arrow functions."},
                {"id": "c", "text": "Increase browser refresh rate via CSS."},
                {"id": "d", "text": "Move state to localStorage."},
            ],
            "correct_answer": "a",
            "explanation": "List virtualization mounts only the items currently inside or adjacent to the viewport window, preserving consistent 60fps scrolling.",
            "tags": ["virtualization", "performance", "ui"],
        },
    ],
    "SQL": [
        {
            "type": "mcq",
            "difficulty": "beginner",
            "question_text": "Which SQL clause is used to filter aggregated grouped rows?",
            "options": [
                {"id": "a", "text": "WHERE"},
                {"id": "b", "text": "HAVING"},
                {"id": "c", "text": "FILTER"},
                {"id": "d", "text": "ORDER BY"},
            ],
            "correct_answer": "b",
            "explanation": "WHERE filters rows before aggregation; HAVING filters groups created by GROUP BY after aggregate functions execute.",
            "tags": ["group_by", "aggregation", "sql_basics"],
        },
        {
            "type": "output_prediction",
            "difficulty": "intermediate",
            "question_text": "Given Table A with 3 rows and Table B with 4 rows, how many rows does `SELECT * FROM A CROSS JOIN B;` return?",
            "options": [
                {"id": "a", "text": "7 rows"},
                {"id": "b", "text": "12 rows"},
                {"id": "c", "text": "3 rows"},
                {"id": "d", "text": "4 rows"},
            ],
            "correct_answer": "b",
            "explanation": "A Cartesian (CROSS) join pairs every row from A with every row from B: 3 * 4 = 12 total rows.",
            "tags": ["joins", "cartesian", "relational"],
        },
        {
            "type": "debugging",
            "difficulty": "advanced",
            "question_text": "Why does this query return zero rows even when users exist without orders?",
            "code_snippet": "SELECT id, name FROM users WHERE id NOT IN (SELECT user_id FROM orders);",
            "options": [
                {"id": "a", "text": "If `orders` contains even one row where `user_id IS NULL`, `NOT IN` evaluates to NULL/False for all comparisons. Use NOT EXISTS instead."},
                {"id": "b", "text": "NOT IN is not valid SQL syntax; only NOT LIKE is permitted."},
                {"id": "c", "text": "Subqueries cannot reference foreign keys."},
                {"id": "d", "text": "SELECT id, name requires an explicit table alias."},
            ],
            "correct_answer": "a",
            "explanation": "SQL three-valued logic causes `x NOT IN (..., NULL)` to evaluate to UNKNOWN (effectively false). `WHERE NOT EXISTS` handles NULLs safely.",
            "tags": ["null_handling", "subqueries", "gotchas"],
        },
        {
            "type": "coding",
            "difficulty": "intermediate",
            "question_text": "Write a standard SQL query using window functions to find the second highest salary from an `employees(id, salary, department)` table.",
            "code_snippet": "-- Write query using DENSE_RANK() or subquery\nSELECT salary FROM employees ...",
            "correct_answer": "WITH ranked AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rk FROM employees) SELECT salary FROM ranked WHERE rk = 2 LIMIT 1;",
            "test_cases": [
                {"input": "employees: [100, 200, 300]", "expected": "200", "description": "Distinct salaries"},
                {"input": "employees: [300, 300, 200]", "expected": "200", "description": "Tied highest salary"},
            ],
            "explanation": "DENSE_RANK() handles duplicate top salaries gracefully, unlike basic LIMIT 1 OFFSET 1 which could return another employee with the same highest salary.",
            "tags": ["window_functions", "ranking", "sql_queries"],
        },
    ],
    "Data Structures": [
        {
            "type": "mcq",
            "difficulty": "beginner",
            "question_text": "What is the average time complexity for key lookup in a balanced hash table?",
            "options": [
                {"id": "a", "text": "O(1)"},
                {"id": "b", "text": "O(log n)"},
                {"id": "c", "text": "O(n)"},
                {"id": "d", "text": "O(n²)"},
            ],
            "correct_answer": "a",
            "explanation": "A well-distributed hash function distributes keys uniformly, giving average O(1) amortized lookup.",
            "tags": ["hashing", "complexity", "data_structures"],
        },
        {
            "type": "debugging",
            "difficulty": "intermediate",
            "question_text": "Identify the missing base case condition that leads to a RecursionError in this binary search implementation:",
            "code_snippet": "def binary_search(arr, target, left, right):\n    mid = (left + right) // 2\n    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        return binary_search(arr, target, mid + 1, right)\n    else:\n        return binary_search(arr, target, left, mid - 1)",
            "options": [
                {"id": "a", "text": "Missing `if left > right: return -1` guard when the target is absent from the array."},
                {"id": "b", "text": "Midpoint calculation must use float division."},
                {"id": "c", "text": "Array must be sorted in descending order."},
                {"id": "d", "text": "The recursive calls must pass len(arr)."},
            ],
            "correct_answer": "a",
            "explanation": "Without `if left > right: return -1`, the boundary pointers cross and recurse indefinitely until maximum call stack exhaustion.",
            "tags": ["binary_search", "recursion", "algorithms"],
        },
    ],
    "Machine Learning": [
        {
            "type": "conceptual",
            "difficulty": "intermediate",
            "question_text": "Explain the Bias-Variance tradeoff. What happens to training and validation loss under high bias versus high variance?",
            "options": None,
            "correct_answer": "High bias causes underfitting: both training and validation losses remain high due to an overly simplistic model. High variance causes overfitting: training loss is very low while validation error is significantly higher due to learning noise.",
            "rubric": [
                {"criterion": "Identifies high bias as underfitting with high train and validation loss", "weight": 0.5, "keywords": ["underfitting", "bias", "simple"]},
                {"criterion": "Identifies high variance as overfitting with low train and high validation error", "weight": 0.5, "keywords": ["overfitting", "variance", "generalization"]},
            ],
            "explanation": "Optimal model complexity minimizes the sum of squared bias, variance, and irreducible error.",
            "tags": ["bias_variance", "generalization", "ml_theory"],
        },
        {
            "type": "scenario",
            "difficulty": "advanced",
            "question_text": "In a medical diagnosis dataset where only 0.5% of cases are malignant, an untrained model predicting 100% benign achieves 99.5% accuracy. Which metrics should you optimize instead?",
            "options": [
                {"id": "a", "text": "Precision, Recall, F1-Score, and PR-AUC (Precision-Recall Area Under Curve)."},
                {"id": "b", "text": "Standard Accuracy and Mean Squared Error."},
                {"id": "c", "text": "Increase batch size to 2048."},
                {"id": "d", "text": "R-squared value."},
            ],
            "correct_answer": "a",
            "explanation": "Severe class imbalance makes naive accuracy deceptive. Recall measures malignant case detection (false negatives minimize fatal outcomes).",
            "tags": ["evaluation_metrics", "imbalance", "classification"],
        },
    ],
    "Git": [
        {
            "type": "mcq",
            "difficulty": "beginner",
            "question_text": "Which Git command integrates changes from another branch by creating a linear, continuous commit history without a merge commit?",
            "options": [
                {"id": "a", "text": "git merge --no-ff"},
                {"id": "b", "text": "git rebase"},
                {"id": "c", "text": "git cherry-pick --all"},
                {"id": "d", "text": "git reset --hard"},
            ],
            "correct_answer": "b",
            "explanation": "git rebase reapplies commits on top of another base tip, maintaining a clean linear commit graph.",
            "tags": ["git", "rebase", "version_control"],
        },
    ],
    "System Design": [
        {
            "type": "scenario",
            "difficulty": "advanced",
            "question_text": "Your API is experiencing thundering herd cache stampedes when hot keys expire in Redis. What is the industry-standard mitigation pattern?",
            "options": [
                {"id": "a", "text": "Implement probabilistic early expiration (e.g. XFetch algorithm) or mutex locks to let one thread recompute while others serve stale cached data."},
                {"id": "b", "text": "Disable Redis TTLs entirely."},
                {"id": "c", "text": "Restart the database cluster every midnight."},
                {"id": "d", "text": "Replace Redis with raw text files on disk."},
            ],
            "correct_answer": "a",
            "explanation": "Mutex locks (single flight) or probabilistic early refreshing ensure only one worker queries the origin database when an item is close to expiry.",
            "tags": ["caching", "scalability", "architecture"],
        },
    ],
}


def get_demo_questions(
    skill_names: List[str],
    count_per_skill: int = 2,
    mode: str = "diagnostic",
    target_difficulty: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Return tailored, adaptive questions for requested skills and assessment mode."""
    selected_questions: List[Dict[str, Any]] = []

    # Map requested skills to closest keys
    normalized_keys = {k.lower(): k for k in DEMO_QUESTIONS_BANK.keys()}

    for skill in skill_names:
        matched_key = normalized_keys.get(skill.lower())
        bank = DEMO_QUESTIONS_BANK.get(matched_key, []) if matched_key else []

        if not bank:
            # Fallback realistic question for catalog skill
            bank = [
                {
                    "type": "mcq",
                    "difficulty": "beginner",
                    "question_text": f"Which principle is central to effective software architecture using {skill}?",
                    "options": [
                        {"id": "a", "text": "Separation of concerns, modularity, and reproducible testing."},
                        {"id": "b", "text": "Coupling all state directly inside one global namespace."},
                        {"id": "c", "text": "Disabling logging in production to reduce overhead."},
                        {"id": "d", "text": "Ignoring error boundaries."},
                    ],
                    "correct_answer": "a",
                    "explanation": f"Best practices in {skill} prioritize modularity, separation of concerns, and resilience.",
                    "tags": [skill.lower(), "architecture"],
                },
                {
                    "type": "scenario",
                    "difficulty": "intermediate",
                    "question_text": f"In a mission-critical service utilizing {skill}, how do you ensure high availability during zero-downtime upgrades?",
                    "options": [
                        {"id": "a", "text": "Deploy using rolling or blue-green release strategies with readiness probes."},
                        {"id": "b", "text": "Terminate all instances simultaneously before booting the new build."},
                        {"id": "c", "text": "Bypass smoke tests to accelerate rollout."},
                        {"id": "d", "text": "Disable DNS resolution during deployments."},
                    ],
                    "correct_answer": "a",
                    "explanation": "Blue-green and rolling deployments route incoming traffic only to verified healthy pods.",
                    "tags": [skill.lower(), "deployment", "devops"],
                },
            ]

        # Filter by mode/difficulty
        if mode == "mastery":
            filtered = [q for q in bank if q.get("difficulty") in ("intermediate", "advanced")]
            if not filtered:
                filtered = bank
        elif mode == "practice":
            filtered = bank
        else:  # diagnostic
            filtered = bank

        if target_difficulty:
            diff_match = [q for q in filtered if q.get("difficulty") == target_difficulty]
            if diff_match:
                filtered = diff_match

        sample_count = min(count_per_skill, len(filtered))
        chosen = random.sample(filtered, sample_count) if sample_count > 0 else filtered

        for q in chosen:
            q_copy = dict(q)
            q_copy["skill_name"] = skill
            selected_questions.append(q_copy)

    # Shuffle for realistic test experience
    random.shuffle(selected_questions)
    return selected_questions


def get_demo_roadmap_modules(career_name: str, weak_skills: List[str]) -> List[Dict[str, Any]]:
    """Return tailored learning modules targeting weak skills and career tracks."""
    modules = [
        {
            "title": f"Core Foundations: {' & '.join(weak_skills[:2]) if weak_skills else 'Modern Fundamentals'}",
            "description": f"Master the essential building blocks of {career_name} with hands-on practice in {', '.join(weak_skills[:3])}.",
            "learning_objectives": [
                "Establish deterministic understanding of syntax, data structures, and scoping",
                "Debug common logical pitfalls and state mutations",
                "Apply clean coding patterns and standard unit test strategies",
            ],
            "topics": [
                {"name": "Runtime Lifecycle & Scoping", "status": "available"},
                {"name": "Data Mutations & Reference Traps", "status": "available"},
                {"name": "Standard Libraries & Package Architecture", "status": "available"},
            ],
            "resources": [
                {"type": "documentation", "title": "Official MDN & Core Spec Documentation", "url": "https://developer.mozilla.org", "description": "Exhaustive API and runtime specification reference"},
                {"type": "video", "title": "Deep Dive Architecture Video Series", "url": "https://youtube.com", "description": "Visualizing memory layout and execution pipelines"},
            ],
            "exercises": [
                {"title": "Algorithmic Implementation Drill", "description": "Solve 3 algorithmic challenges focusing on time complexity.", "difficulty": "intermediate"},
                {"title": "Production Bug Investigation", "description": "Diagnose and fix an asynchronous state race condition.", "difficulty": "intermediate"},
            ],
            "mini_project": {
                "title": "Configurable Data Transformer Service",
                "description": "Construct an end-to-end data transformation utility with schema validation and test coverage.",
                "deliverables": ["Source code repository", "Suite of automated unit tests", "Architecture rationale document"],
            },
            "estimated_hours": 18.0,
            "difficulty": "beginner",
            "order_index": 1,
        },
        {
            "title": f"Applied Architecture for {career_name}",
            "description": "Bridge isolated code snippets into scalable, production-grade micro-architectures and integrated systems.",
            "learning_objectives": [
                "Design resilient API interfaces and contract schemas",
                "Implement caching and database transaction strategies",
                "Manage state transitions and error boundaries",
            ],
            "topics": [
                {"name": "REST & Graph Interface Contracts", "status": "locked"},
                {"name": "State Management & Reactive Stores", "status": "locked"},
                {"name": "Resilience & Fallback Strategies", "status": "locked"},
            ],
            "resources": [
                {"type": "article", "title": "Enterprise System Design Principles", "url": "https://martinfowler.com", "description": "Patterns of enterprise application architecture"},
                {"type": "documentation", "title": "API Security & Rate Limiting Best Practices", "url": "https://owasp.org", "description": "OWASP API Security Top 10 guidelines"},
            ],
            "exercises": [
                {"title": "Mock API Endpoint Implementation", "description": "Build authenticated CRUD endpoints with rate limits.", "difficulty": "intermediate"},
            ],
            "mini_project": {
                "title": "High-Throughput Dashboard Gateway",
                "description": "Create an API gateway service that aggregates multiple backend streams with caching.",
                "deliverables": ["Gateway implementation", "Benchmarking performance results", "Containerized Dockerfile"],
            },
            "estimated_hours": 24.0,
            "difficulty": "intermediate",
            "order_index": 2,
        },
        {
            "title": f"Production Deployment & System Mastery",
            "description": "Finalize real-world readiness with observability, container orchestration, and continuous integration pipelines.",
            "learning_objectives": [
                "Deploy services with zero-downtime rolling update configurations",
                "Configure distributed telemetry, tracing, and metric alerts",
                "Execute load tests and diagnose performance bottlenecks",
            ],
            "topics": [
                {"name": "Docker Containerization & Multi-Stage Builds", "status": "locked"},
                {"name": "Structured Logging & Distributed Tracing", "status": "locked"},
                {"name": "Continuous Integration & Automated Validation", "status": "locked"},
            ],
            "resources": [
                {"type": "documentation", "title": "Production Checklist & SRE Handbook", "url": "https://sre.google", "description": "Google Site Reliability Engineering principles"},
            ],
            "exercises": [
                {"title": "Multi-stage Dockerfile Optimization", "description": "Reduce image size from 1.2GB to under 80MB.", "difficulty": "advanced"},
            ],
            "mini_project": {
                "title": "Autonomous CI/CD Pipeline & Health Monitor",
                "description": "Build an automated testing and deployment workflow with rollback verification.",
                "deliverables": ["CI configuration file", "Health check probes", "Deployment log evidence"],
            },
            "estimated_hours": 20.0,
            "difficulty": "advanced",
            "order_index": 3,
        },
    ]
    return modules


def get_demo_insights() -> List[Dict[str, Any]]:
    """Return categorized learner intelligence insights across all 7 cognitive domains."""
    return [
        {
            "type": "academic",
            "category": "academic",
            "title": "Consistent Academic Foundation",
            "description": "Academic records show strong performance in Computer Science foundations (GPA: 3.82) with verified excellence in Data Structures, Algorithms, and Database Management.",
            "priority": "low",
            "evidence": ["Academic marksheets verified: 88.5% average in core subjects", "Strong analytical coursework in CSE"],
        },
        {
            "type": "learning_velocity",
            "category": "learning_velocity",
            "title": "Rapid Concept Absorption in Practical Drills",
            "description": "Module progression indicates 2.4x faster completion velocity on hands-on coding exercises compared to passive reading materials.",
            "priority": "medium",
            "evidence": ["12 coding challenges solved under target time", "Interactive drill completion rate: 94%"],
        },
        {
            "type": "assessment_performance",
            "category": "assessment",
            "title": "Diagnostic Assessment Baseline: 72.5%",
            "description": "Initial diagnostic exam calibrated high competency in HTML (90%), Python (84%), and CSS (82%), with identified friction in SQL relational querying (42%).",
            "priority": "high",
            "evidence": ["Diagnostic score: 72.5%", "Correctly resolved 8 of 11 multi-tier challenges", "Deterministic scoring verified"],
        },
        {
            "type": "interest_alignment",
            "category": "interest_alignment",
            "title": "High Engagement in Cloud & Backend Systems",
            "description": "Selected interest categories directly reinforce target career trajectory. High interest logged in Full Stack, Cloud Infrastructure, and Microservices.",
            "priority": "medium",
            "evidence": ["Primary interest: Full Stack Development", "Secondary interest: Cloud Infrastructure", "AI interests quiz: 92% alignment"],
        },
        {
            "type": "career_fit",
            "category": "career_fit",
            "title": "Strong Trajectory for Full Stack Developer",
            "description": "Demonstrated mastery across 6 verified competencies satisfies 50% of mandatory track requirements with an overall career readiness index of 39.3%.",
            "priority": "high",
            "evidence": ["6 verified competencies aligned with Full Stack track", "Current readiness score: 39.3%", "Calculated runway: 12 weeks"],
        },
        {
            "type": "skill_improvement",
            "category": "skill_improvement",
            "title": "SQL Query Optimization & Data Modeling Priority",
            "description": "Assessment evaluation identified struggle with complex joins, window functions, and NULL handling in subqueries (SQL Score: 42.0%). Practice mode will accelerate mastery.",
            "priority": "critical",
            "evidence": ["SQL Diagnostic score: 42.0%", "Missed HAVING vs WHERE filtering", "Incorrect subquery NULL resolution"],
        },
        {
            "type": "recommendation",
            "category": "recommendation",
            "title": "Target SQL Deep Dive & React Component Architecture",
            "description": "Prioritize Module 2: Applied Architecture to elevate SQL proficiency above 70% before attempting the Full Stack mastery exam.",
            "priority": "high",
            "evidence": ["SQL is a tier-1 requirement for Full Stack track", "React state batching knowledge verified"],
        },
    ]

