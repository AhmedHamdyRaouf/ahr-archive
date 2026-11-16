# Wireframes — Media Library

**Screens:** Library Grid/List, Upload, Asset Detail/Edit

## Composition
Grid of thumbnail cards (image/audio/video icon for non-visual types) with status/verification badges overlaid. Upload is a focused two-step form: owner-entity selection first, then file — this order is a deliberate rule (see below).

```
┌─────────┬─────────┬─────────┐
│ [thumb]  │ [thumb]  │ [thumb]  │
│ caption  │ caption  │ caption  │
│ [badge]  │ [badge]  │ [badge]  │
└─────────┴─────────┴─────────┘

Upload: [Owner entity picker] → [File input] → [Progress]
```

## Components
`MediaGrid`, `MediaUploadForm`, `MediaAssetDetail`, Badge (status/verification/type), upload progress indicator.

## UX Rule Enforced Here
Owner selection happens before or alongside file selection, never as an afterthought — prevents orphaned, unowned uploads.

## State Coverage Required
Loading (grid skeleton; upload progress) · Error (upload failure → retry, no orphaned record; unsupported type rejected before upload begins) · Empty ("No media yet" + Upload button) · Success (Toast; new asset appears immediately).

## Cross-Reference
Full behavioral spec: original UI/UX Specification, Media Library UI. Flow: `User Flows/README.md` §6.
