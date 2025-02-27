# Russian Doll / Multi Chain Prompt Injection

## Description
Technique to attack multi-llm systems by embedding multiple instructions, sometimes using evasions to execute on different LLMs down the line.

## Attack Examples
- Embedding reversed instructions for code cleaning models
- Using chain-specific formatting to bypass filters
- Nesting instructions within seemingly innocent prompts
- Exploiting inter-model communication patterns
- Using model-specific syntax in nested commands
- Creating delayed activation triggers
- Reference: https://labs.withsecure.com/publications/multi-chain-prompt-injection-attacks
