# Coding Rules

Language: Typescript + PHP

Rules:

1. Use async/await
2. No callback style
3. Always validate input
4. API response format:

{
success: boolean,
data: object,
error: string|null
}

5. Follow folder structure

controllers/
services/
repositories/
