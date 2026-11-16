#!/bin/sh
# Vercel "Ignored Build Step": exit 0 = skip the build, exit 1 = build.
# Builds when anything under dashboard/ changed since the last deployed commit; when that commit
# is not in the (shallow) clone it is fetched, and if it still cannot be found the build runs.
prev="$VERCEL_GIT_PREVIOUS_SHA"
if [ -n "$prev" ] && ! git cat-file -e "$prev^{commit}" 2>/dev/null; then
  git fetch --quiet --depth=100 origin main 2>/dev/null
fi
if [ -n "$prev" ] && git cat-file -e "$prev^{commit}" 2>/dev/null; then
  git diff --quiet "$prev" HEAD -- .
  exit $?
fi
exit 1
