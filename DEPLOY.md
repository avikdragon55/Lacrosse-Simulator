# PLS Website Deployment

This game needs a real server because the OpenAI API key must stay private.
Do not put the API key inside `game.js`, `index.html`, or `styles.css`.

## Local AI Setup

Create a file named `.env` in this folder:

```env
OPENAI_API_KEY=your_real_openai_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_FALLBACK_MODELS=gpt-4o-mini
PORT=5173
```

Then run:

```bash
cd /Users/avikhardy/pls-game
python3 server.py
```

Open:

```text
http://localhost:5173
```

## Public Website Setup With Render

1. Create a GitHub account if you do not have one.
2. Create a new GitHub repository for this folder.
3. Upload these files to that repository.
4. Go to Render and create a new Web Service from the repository.
5. Use this start command:

```bash
HOST=0.0.0.0 python3 server.py
```

6. Add environment variables in Render:

```text
OPENAI_API_KEY=your_real_openai_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_FALLBACK_MODELS=gpt-4o-mini
```

7. Deploy the service.

Render will give you a public URL like:

```text
https://pls-game.onrender.com
```

## Custom Domain

To use a name like `something.com`, buy a domain from a domain registrar, then add it in the Render Custom Domains settings. Google search results can take days or weeks after the site is public.
