const input = document.querySelector("#search-input");
const output = document.querySelector("#search-results");
let pagefind;
async function search() {
  const query = input?.value.trim() ?? "";
  if (!output) return;
  if (query.length < 2) {
    output.innerHTML = "";
    return;
  }
  pagefind ??= await import("/pagefind/pagefind.js");
  const result = await pagefind.search(query);
  const items = await Promise.all(result.results.slice(0, 12).map((item) => item.data()));
  output.replaceChildren(
    ...items.map((item) => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = item.url;
      const title = document.createElement("h2");
      title.textContent = item.meta.title;
      const excerpt = document.createElement("p");
      excerpt.innerHTML = item.excerpt;
      card.append(title, excerpt);
      return card;
    }),
  );
  if (!items.length) output.textContent = `No results for “${query}”.`;
}
input?.addEventListener("input", search);
const initial = new URLSearchParams(location.search).get("q");
if (initial && input) {
  input.value = initial;
  search();
}
