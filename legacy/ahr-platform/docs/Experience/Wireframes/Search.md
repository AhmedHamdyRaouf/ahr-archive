# Wireframes — Search

**Screens:** Search Results (`/{locale}/search`, public only). Admin search has no dedicated screen — embedded in each module's Entity List filter bar (see Wireframes/CMS.md, Contacts-Organizations.md).

## Composition
Search input (pre-filled with current query) at top; `CategoryTagFilterBar` beside/below it; result list using the same `EntityCard` as other Website listings — a search result never looks like a different kind of thing than browsing directly.

```
[SearchBar: "query"          ] [Category ▾] [Tag ▾]
┌─────────┐ ┌─────────┐ ┌─────────┐
│EntityCard│ │EntityCard│ │EntityCard│
└─────────┘ └─────────┘ └─────────┘
```

## State Coverage Required
Loading (skeleton result list) · Empty (zero results → helpful message + suggested Categories/Tags, never a dead end) · Error ("search is temporarily unavailable," input stays usable).

## Security Rule Enforced Here
Public search is filtered to published+public content only, enforced server-side — never trust a client-side filter.

## Cross-Reference
Full behavioral spec: original UI/UX Specification, Search UI. Flow: `User Flows/README.md` §4.
