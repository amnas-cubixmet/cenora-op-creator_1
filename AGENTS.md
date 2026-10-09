<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep doctor master data in a typed static configuration and derive all poster views from it, because doctor updates are rare and must not require runtime persistence.
- Keep the poster workspace sticky within the main settings grid without overflow on its ancestors; constrain the workspace to viewport height so desktop scrolling preserves access to the poster and downloads.
- Load separate local regular and bold Malayalam font faces so department emphasis is rendered faithfully in the preview and PNG export.
- Use the shared FitText line limit for poster text wrapping so departments can occupy two lines before shrinking.
- Treat unavailable static doctor photo paths as placeholders so missing assets never block poster export.
- Allocate fixed equal-height poster rows and fit each card's text and full photo footprint within its row, because doctor counts and qualification lengths vary.
- Render page counters only in the workspace outside the poster node, because PNG exports must contain only poster artwork.
