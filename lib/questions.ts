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
      { text: "There\u2019s an accidentally quadratic algorithm hidden in the parse \u2014 something like strlen being called on every read of a growing buffer, or duplicate checking by scanning the full list on each insert. A 12x increase in n with O(n\u00b2) behavior yields ~144x slowdown, which matches the observed 180x. The fix is to find the nested linear scan hiding behind a seemingly simple operation.", score: 0 },
      { text: "The JSON parser has O(n log n) behavior because it\u2019s internally building a balanced tree or sorted index structure as it ingests entries. The superlinear growth is expected and consistent with the data size jump. The fix is to split the config into multiple smaller files so each parse stays within the fast range of the algorithm\u2019s curve.", score: 1 },
      { text: "The file has outgrown the parser\u2019s in-memory buffer and it\u2019s spilling to disk on every token read. This turns what was a fast memory operation into repeated disk I/O with seek penalties. A streaming JSON parser that processes tokens without buffering the full document would eliminate the spill and restore linear performance.", score: 2 },
      { text: "The startup is I/O bound because 63,000 entries means significantly more sequential disk reads, and the filesystem is fragmenting the larger file across more blocks. Moving the config to Redis or another in-memory store would eliminate the disk bottleneck and bring startup back under a few seconds regardless of entry count.", score: 3 },
    ],
  },
  {
    scenario: "BUG REPORT: Every RPC call between your two services takes exactly 200ms longer than expected. Not approximately \u2014 exactly 200ms, every single time. Network ping is 0.5ms. The payload is tiny (< 100 bytes). The server processes the request in < 1ms. Both services are on the same data center rack.",
    question: "Sub-millisecond network, sub-millisecond processing, but an exact 200ms penalty on every call. What\u2019s causing it?",
    category: "systems",
    options: [
      { text: "It\u2019s a DNS resolution delay \u2014 each RPC call is performing a fresh hostname lookup instead of caching the resolved address. The 200ms is the round-trip to the DNS server plus its internal lookup time, which is consistent and repeatable. Switch to IP addresses directly or configure the resolver to cache aggressively with a longer TTL.", score: 3 },
      { text: "Nagle\u2019s algorithm is buffering the small write, waiting for an ACK before sending. Meanwhile, TCP delayed ACK on the receiver is holding the ACK for up to 200ms hoping to piggyback it on a response. Neither side yields \u2014 it\u2019s a protocol-level deadlock that resolves only when the delayed ACK timer fires. Set TCP_NODELAY to disable Nagle\u2019s buffering.", score: 0 },
      { text: "The RPC framework has a built-in retry mechanism with a 200ms backoff delay. The first attempt is silently failing due to a serialization version mismatch between the two services, and the second attempt succeeds. The exact timing comes from the hardcoded retry interval in the framework\u2019s default configuration.", score: 2 },
      { text: "The connection pool has a 200ms acquisition timeout \u2014 when no idle connection is immediately available, the client waits exactly that long before spinning up a new one. The pool is undersized for the current request rate, so every call hits the timeout ceiling before getting a connection. Increase the max pool size.", score: 1 },
    ],
  },
  {
    scenario: "INCIDENT: You deploy a new regex-based input validation rule to your web application firewall. Within 60 seconds, every server\u2019s CPU spikes to 100% and stays there. The regex looks simple enough: .*(?:.*=.*). Rollback takes 10 minutes because the servers are too overloaded to accept deploy commands.",
    question: "A \u201csimple\u201d regex is consuming infinite CPU. What property of this pattern makes it catastrophic?",
    category: "debugging",
    options: [
      { text: "The regex engine is being compiled from source on every incoming request rather than being pre-compiled and cached at startup. The compilation involves parsing the pattern into an NFA, optimizing it, and generating bytecode \u2014 multiplied by millions of requests per second, this compilation overhead alone saturates all available CPU cores.", score: 1 },
      { text: "It\u2019s catastrophic backtracking \u2014 the nested .* quantifiers inside the group create exponentially many ways the engine can partition the input between the outer and inner wildcards. When no match is found, the engine exhausts all O(2\u207f) possible partitions before giving up. A single long input string can take minutes. The fix is atomic groups, possessive quantifiers, or eliminating nested wildcards.", score: 0 },
      { text: "The WAF is evaluating the regex synchronously on the request-handling thread, and the blocking nature means each in-flight request holds a thread hostage while the regex runs. With the thread pool fully consumed, no new requests can be accepted, and the deploy system\u2019s health checks also get blocked, preventing rollback.", score: 3 },
      { text: "The regex is being evaluated against the entire HTTP request body for every incoming request, including large file uploads and API payloads. At millions of requests per second with varying body sizes, the sheer volume of text being scanned by even a well-behaved regex is enough to overwhelm the CPU. Restrict matching to headers and URL only.", score: 2 },
    ],
  },
  {
    scenario: "INCIDENT: At exactly 3:00 AM, your database CPU spikes from 15% to 100% and stays pegged. The app returns 504s. Nothing was deployed. There are no cron jobs at 3 AM. Your cache layer (Redis) is healthy, but cache hit rate dropped from 99.2% to 0.1% at exactly 3:00 AM. All cache keys were written at 2:00 AM with a 1-hour TTL.",
    question: "The cache is healthy but empty. The database is drowning. What happened and what\u2019s the fix?",
    category: "architecture",
    options: [
      { text: "Redis hit its configured maxmemory limit at exactly 3:00 AM and began evicting keys aggressively under its allkeys-lru policy. The sudden mass eviction dropped the hit rate to near zero, and all traffic fell through to the database simultaneously. Increase Redis memory limits and monitor eviction metrics to catch this before it cascades.", score: 1 },
      { text: "The cache warming pipeline that runs at 2:00 AM failed silently today \u2014 no data was written to Redis, so when the previous keys expired at 3:00 AM there was nothing to replace them. All requests hit the database directly. Add health checks and alerting on the warming job so failures are caught within minutes, not after the outage.", score: 2 },
      { text: "Cache stampede \u2014 every key was written at the same time with the same TTL, so they all expired simultaneously at 3:00 AM. Thousands of concurrent requests each independently saw a cache miss and queried the database, creating a thundering herd that overwhelmed it. Fix with TTL jitter (randomize expiry across a range), mutex-based recomputation, or stale-while-revalidate.", score: 0 },
      { text: "The database is fundamentally undersized for direct traffic \u2014 the cache has been masking this for months. Rather than patching the cache layer, the real fix is to vertically scale the database or add read replicas so it can handle the full request load even during cache misses, eliminating this single point of failure.", score: 3 },
    ],
  },
  {
    scenario: "INCIDENT: A single HTTP POST request \u2014 just 2MB in size \u2014 pins your server\u2019s CPU at 100% for 30 minutes. The request body contains 100,000 form parameters. Memory usage is normal. No other requests can be processed. This isn\u2019t a flood attack \u2014 it\u2019s a single request from a single IP.",
    question: "One 2MB request takes down your entire server for 30 minutes. How?",
    category: "algorithms",
    options: [
      { text: "The form parameters are each being individually validated against a database lookup, and 100K sequential queries are exhausting the connection pool. Every other request in the application is now starved for database connections, creating a cascading failure. Rate-limit the number of parameters per request and batch validation queries together.", score: 3 },
      { text: "Hash collision attack \u2014 the attacker crafted 100K parameter names that all hash to the same bucket in your language\u2019s hash table implementation. Every insert degenerates from O(1) to O(n) as it walks the collision chain, making total insertion O(n\u00b2). With 100K keys that\u2019s ~10 billion operations. Fix with randomized hashing (SipHash), a parameter count limit, or a per-request CPU timeout.", score: 0 },
      { text: "The server\u2019s parameter parsing step is performing O(n log n) sorting \u2014 it canonicalizes form parameters into alphabetical order for consistent logging and signature verification. With 100K string parameters the comparison-heavy sort becomes extremely expensive, especially with long key names that share common prefixes.", score: 1 },
      { text: "The recursive descent parser is trying to build 100K parameters into a deeply nested object tree, and the deep recursion is repeatedly overflowing the call stack. Each stack overflow triggers an expensive recovery and restart of the parsing from a checkpoint, burning CPU in an endless loop of crash-and-retry cycles.", score: 2 },
    ],
  },
  {
    scenario: "BUG REPORT: Your fintech app processes 2 million transactions per day. Auditors found that the ledger is off by $0.01 on approximately 3% of transactions. The discrepancy always favors or disfavors the user by exactly one cent \u2014 never more. The math in code looks correct: price * quantity * taxRate. All values are stored as doubles. The tests all pass.",
    question: "The code looks right, the tests pass, but real money is disappearing. What\u2019s wrong?",
    category: "systems",
    options: [
      { text: "The tax rate table is being updated asynchronously, and during the propagation window some workers still use the old rate while others have the new one. This creates a systematic one-cent rounding difference on transactions that span the update boundary. The fix is atomic rate propagation \u2014 all workers must switch simultaneously via a versioned config.", score: 1 },
      { text: "IEEE 754 floating-point cannot represent most decimal fractions exactly \u2014 0.1 + 0.2 equals 0.30000000000000004 in every language. Multiplying prices by quantities by tax rates compounds these tiny representation errors, and final rounding to cents pushes some results across the penny boundary. Fix by using integer arithmetic in the smallest currency unit, or a decimal type with exact representation.", score: 0 },
      { text: "There\u2019s a race condition in the transaction pipeline where two concurrent operations read the same account balance before either writes. The second write overwrites the first, creating a one-cent discrepancy that exactly matches the rounding difference between the two concurrent calculations. Database-level row locking on balance updates would serialize the conflicting writes.", score: 2 },
      { text: "The database column is defined as DECIMAL(10,2) but the application sends values as IEEE 754 doubles over the wire. The database driver silently rounds during the type conversion on every write, and the rounding direction depends on the exact bit pattern. Matching the application\u2019s type to the column type eliminates the conversion loss.", score: 3 },
    ],
  },
  {
    scenario: "REFLECTION: You shipped a feature last week using AI assistance. Today, a critical bug is filed against it. You open the file \u2014 400 lines of code you supposedly wrote. You don\u2019t recognize any of it. You can\u2019t trace the data flow. You\u2019re not even sure what half the functions do. Your AI assistant is down for maintenance.",
    question: "Be honest. What happens next?",
    category: "meta",
    options: [
      { text: "You search git blame to find the commit messages and PR descriptions that explain the intent behind each function, then cross-reference the AI-generated code with common patterns from the framework\u2019s official documentation. You reconstruct the \u201cwhy\u201d from external context \u2014 changelogs, review comments, ticket descriptions \u2014 rather than trying to read the code cold.", score: 2 },
      { text: "You write a minimal failing test that reproduces the bug first, then use that as a guardrail while you read through the unfamiliar code. You don\u2019t need to understand the whole file \u2014 just the execution path the bug takes. Narrow the scope with the test, add print statements along the path, and trace the failure backwards from the assertion.", score: 1 },
      { text: "You start from the entry point \u2014 find where the request comes in, trace the data flow function by function with a debugger or print statements, and rebuild the mental model manually. You\u2019ve read code you didn\u2019t write before \u2014 open source, coworkers\u2019 code, legacy systems. This is the same skill. The AI was a speed boost for writing; reading and reasoning is still yours.", score: 0 },
      { text: "You wait for the AI assistant to come back online \u2014 have it explain the code structure to you, walk through the data flow, then suggest the fix. In the meantime you document the bug thoroughly, gather reproduction steps, and check if other users are affected. The AI wrote it, so the AI has the best context to debug it.", score: 3 },
    ],
  },
];

export const optionLabels = ["A", "B", "C", "D"];
