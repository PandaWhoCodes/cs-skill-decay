import { CategoryId } from "./scoring";

export interface QuestionOption {
  text: string;
  score: number;
}

export interface Question {
  scenario: string;
  question: string;
  category: CategoryId;
  options: QuestionOption[];
}

export const questions: Question[] = [
  {
    scenario: "BUG REPORT: Your service parses a JSON config file at startup. For years it loaded in 2 seconds. The config has grown from 5,000 entries to 63,000 entries \u2014 a 12x increase. But startup now takes 6 minutes \u2014 a 180x increase. CPU is pegged on a single core during the entire load. No other changes.",
    question: "A 12x data increase caused a 180x slowdown. What\u2019s happening?",
    category: "algorithms",
    options: [
      { text: "There\u2019s an accidentally quadratic algorithm \u2014 likely parsing each entry with a function that\u2019s secretly O(n) itself (like strlen on every read of a growing buffer), or checking for duplicates by scanning the full list on each insert. 12x data with O(n\u00b2) behavior gives ~144x slowdown \u2014 that matches. Find the nested loop hiding inside a \u201csimple\u201d parse.", score: 0 },
      { text: "The JSON file is too large for the parser\u2019s memory buffer, so it\u2019s doing excessive disk I/O \u2014 swapping parts of the file in and out. Switch to a streaming JSON parser to fix it.", score: 2 },
      { text: "The startup is I/O bound \u2014 63,000 entries means more disk reads. Use an SSD or load the config from a faster storage backend like Redis.", score: 3 },
      { text: "The JSON parser has O(n log n) behavior because it\u2019s building a sorted index internally. The superlinear growth is expected for this data size \u2014 optimize by splitting the config into smaller files.", score: 1 },
    ],
  },
  {
    scenario: "BUG REPORT: Every RPC call between your two services takes exactly 200ms longer than expected. Not approximately \u2014 exactly 200ms, every single time. Network ping is 0.5ms. The payload is tiny (< 100 bytes). The server processes the request in < 1ms. Both services are on the same data center rack.",
    question: "Sub-millisecond network, sub-millisecond processing, but an exact 200ms penalty on every call. What\u2019s causing it?",
    category: "systems",
    options: [
      { text: "Nagle\u2019s algorithm is buffering the small write, waiting for an ACK before sending. Meanwhile, TCP delayed ACK on the other side is holding the ACK for up to 200ms hoping to piggyback it on a response. Neither side yields \u2014 it\u2019s a deadlock that resolves on a timer. Set TCP_NODELAY on the socket to disable Nagle\u2019s algorithm.", score: 0 },
      { text: "There\u2019s a 200ms connection pool timeout \u2014 when no idle connection is available, the client waits 200ms before creating a new one. The pool is undersized for the request rate. Increase the pool size.", score: 1 },
      { text: "The RPC framework has a built-in retry delay \u2014 the first attempt silently fails due to a serialization mismatch, and the 200ms is the retry backoff interval. Check the framework\u2019s retry configuration.", score: 2 },
      { text: "It\u2019s a DNS resolution delay \u2014 each RPC call is resolving the service hostname, and the DNS TTL or lookup is adding 200ms. Cache the DNS resolution or use IP addresses directly.", score: 3 },
    ],
  },
  {
    scenario: "INCIDENT: You deploy a new regex-based input validation rule to your web application firewall. Within 60 seconds, every server\u2019s CPU spikes to 100% and stays there. The regex looks simple enough: .*(?:.*=.*). Rollback takes 10 minutes because the servers are too overloaded to accept deploy commands.",
    question: "A \u201csimple\u201d regex is consuming infinite CPU. What property of this pattern makes it catastrophic?",
    category: "debugging",
    options: [
      { text: "It\u2019s catastrophic backtracking \u2014 the nested .* quantifiers create exponentially many ways to match the same input. When the regex engine fails to match, it backtracks through all possible combinations of where each .* could have consumed characters. For an n-character string, this is O(2\u207f) in the worst case. The fix: use atomic groups, possessive quantifiers, or rewrite to avoid nested wildcards entirely.", score: 0 },
      { text: "The regex is matching against every incoming request\u2019s full body, and the sheer volume of text being scanned across millions of requests per second is overwhelming the CPU \u2014 switch to matching only the URL and headers.", score: 2 },
      { text: "The regex engine is compiled at runtime for each request instead of being pre-compiled. The compilation cost multiplied by millions of requests is the bottleneck \u2014 pre-compile the regex at startup.", score: 1 },
      { text: "The WAF is running in synchronous mode, blocking each request until the regex completes. Put the regex evaluation behind an async queue with a timeout so it doesn\u2019t block the main request thread.", score: 3 },
    ],
  },
  {
    scenario: "INCIDENT: At exactly 3:00 AM, your database CPU spikes from 15% to 100% and stays pegged. The app returns 504s. Nothing was deployed. There are no cron jobs at 3 AM. Your cache layer (Redis) is healthy, but cache hit rate dropped from 99.2% to 0.1% at exactly 3:00 AM. All cache keys were written at 2:00 AM with a 1-hour TTL.",
    question: "The cache is healthy but empty. The database is drowning. What happened and what\u2019s the fix?",
    category: "architecture",
    options: [
      { text: "Cache stampede \u2014 all keys expired simultaneously because they share the same TTL. Thousands of concurrent requests all see a cache miss at once and each independently queries the database. The database can\u2019t handle the sudden thundering herd. Fix: add random jitter to TTLs (e.g., 55\u201365 min instead of exactly 60), implement lock-based recomputation (only one request recomputes while others wait), or use stale-while-revalidate to serve expired data while refreshing in the background.", score: 0 },
      { text: "Redis hit a memory limit at 3:00 AM and evicted all keys using its eviction policy. The database spike is from all the cache misses after eviction. Increase Redis memory limits.", score: 1 },
      { text: "The cache warming job that runs at 2:00 AM failed today, so the data was never cached. Add monitoring and alerts on the cache warming pipeline so you catch failures before they cascade.", score: 2 },
      { text: "Scale up the database to handle the load \u2014 if the database can\u2019t handle direct traffic, that\u2019s the real problem. The cache is masking an undersized database.", score: 3 },
    ],
  },
  {
    scenario: "INCIDENT: A single HTTP POST request \u2014 just 2MB in size \u2014 pins your server\u2019s CPU at 100% for 30 minutes. The request body contains 100,000 form parameters. Memory usage is normal. No other requests can be processed. This isn\u2019t a flood attack \u2014 it\u2019s a single request from a single IP.",
    question: "One 2MB request takes down your entire server for 30 minutes. How?",
    category: "algorithms",
    options: [
      { text: "Hash collision attack \u2014 the attacker crafted 100K parameter names that all hash to the same bucket. Your language\u2019s hash table degenerates from O(1) to O(n) per lookup, making insertion of n keys O(n\u00b2). With 100K keys, that\u2019s 10 billion operations from a single request. Fix: use a randomized hash function (SipHash), limit the number of POST parameters, or set a request processing timeout.", score: 0 },
      { text: "The server is trying to parse 100K parameters into a deeply nested object structure, and the recursive parsing is blowing the call stack, causing repeated stack overflow recoveries that consume CPU. Limit request body depth.", score: 2 },
      { text: "The form parameters are being validated against a database, and 100K individual queries are overwhelming the connection pool. Add batch validation or rate-limit the number of parameters per request.", score: 3 },
      { text: "The server\u2019s parameter parsing has O(n log n) sorting overhead \u2014 it alphabetizes form parameters for canonical representation. With 100K parameters, the sort is expensive. Disable parameter sorting.", score: 1 },
    ],
  },
  {
    scenario: "BUG REPORT: Your fintech app processes 2 million transactions per day. Auditors found that the ledger is off by $0.01 on approximately 3% of transactions. The discrepancy always favors or disfavors the user by exactly one cent \u2014 never more. The math in code looks correct: price * quantity * taxRate. All values are stored as doubles. The tests all pass.",
    question: "The code looks right, the tests pass, but real money is disappearing. What\u2019s wrong?",
    category: "systems",
    options: [
      { text: "IEEE 754 floating-point can\u2019t represent most decimal fractions exactly \u2014 0.1 + 0.2 = 0.30000000000000004 in every language. Multiplying prices by quantities by tax rates compounds tiny representation errors, and rounding to cents pushes them across the $0.01 boundary. Fix: use integer arithmetic in cents (or smallest currency unit), or a decimal type with exact representation. The tests pass because they compare with insufficient precision or use round numbers.", score: 0 },
      { text: "There\u2019s a race condition in the transaction pipeline \u2014 two concurrent transactions occasionally read the same balance, and the last write wins, causing a one-cent discrepancy. Add database-level locking on balance updates.", score: 2 },
      { text: "The tax rate calculation is using a stale rate \u2014 when tax rates update, some in-flight transactions use the old rate, creating a rounding difference. Ensure atomic tax rate updates across all workers.", score: 1 },
      { text: "The database is truncating values on storage \u2014 doubles in the application have more precision than the DECIMAL(10,2) column in the database, so values are being rounded during writes. Match the precision between application and database.", score: 3 },
    ],
  },
  {
    scenario: "REFLECTION: You shipped a feature last week using AI assistance. Today, a critical bug is filed against it. You open the file \u2014 400 lines of code you supposedly wrote. You don\u2019t recognize any of it. You can\u2019t trace the data flow. You\u2019re not even sure what half the functions do. Your AI assistant is down for maintenance.",
    question: "Be honest. What happens next?",
    category: "meta",
    options: [
      { text: "You start from the entry point \u2014 find where the request comes in, trace the data flow function by function with a debugger or print statements, rebuild the mental model manually. You\u2019ve read code you didn\u2019t write before (open source, coworkers\u2019 code, legacy systems). This is the same skill. The AI was a speed boost for writing \u2014 reading and reasoning is still yours.", score: 0 },
      { text: "You write a failing test that reproduces the bug first, then use that as a guardrail while you read through the code. You may not understand the whole file, but you only need to understand the path the bug takes. Narrow the scope, trace the failure.", score: 1 },
      { text: "You search git blame and PR comments to understand the intent behind each function, then check if the AI-generated code matches common patterns from the framework docs. Reconstruct the \u201cwhy\u201d from external context rather than reading the code directly.", score: 2 },
      { text: "You wait for the AI to come back online \u2014 have it explain the code to you, then have it suggest the fix. Use the downtime to document the bug and gather reproduction steps. The AI wrote it; the AI should debug it.", score: 3 },
    ],
  },
];

export const optionLabels = ["A", "B", "C", "D"];
