(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/Desktop/allsafe-parents/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/allsafe-parents/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/allsafe-parents/node_modules/next/head.js [client] (ecmascript)");
;
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: "Allsafex · unified Allsafe‑Access & product grid"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                        children: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --bg-main: #f6f9fe;
            --card-bg: #ffffff;
            --navy-deep: #0b1e32;
            --navy-mid: #1e3a5f;
            --allsafe-blue: #1d4ed8;
            --shonet-green: #0f766e;
            --accent-amber: #b45309;
            --text-dark: #17212d;
            --text-muted: #33475b;
            --border-soft: #dee7f2;
            --cool-shadow: 0 20px 30px -10px rgba(0, 30, 50, 0.12);
            --radius-card: 2rem;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--bg-main);
            color: var(--text-dark);
            line-height: 1.5;
          }
          html { scroll-behavior: smooth; }

          nav {
            background: var(--navy-deep);
            height: 80px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8%;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid #1e4468;
          }

          .logo {
            font-size: 2rem;
            font-weight: 800;
            color: white;
            letter-spacing: -1px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }
          .logo-box {
            width: 36px;
            height: 36px;
            background: linear-gradient(145deg, #2563eb, #0f766e);
            border-radius: 10px;
          }
          .nav-links {
            display: flex;
            gap: 2.5rem;
            align-items: center;
          }
          .nav-links a {
            color: #c1d9ff;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
          }
          .nav-links a:hover { color: white; }

          .hero {
            background: var(--navy-deep);
            padding: 100px 8% 140px;
            color: white;
            text-align: center;
          }
          .hero h1 {
            font-size: clamp(2.8rem, 7vw, 4.8rem);
            font-weight: 800;
            letter-spacing: -1.5px;
          }
          .hero .sub {
            font-size: 1.3rem;
            color: #b4d0ff;
            max-width: 750px;
            margin: 1rem auto 2rem;
          }

          /* domain strip */
          .domain-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem 3rem;
            background: rgba(255,255,255,0.6);
            backdrop-filter: blur(8px);
            margin: 20px auto 30px;
            padding: 1rem 2.5rem;
            border-radius: 60px;
            width: fit-content;
            border: 1px solid var(--border-soft);
          }
          .domain-item a {
            text-decoration: none;
            font-weight: 600;
            color: var(--navy-deep);
            font-size: 1rem;
          }
          .domain-item a:hover { color: var(--allsafe-blue); }

          /* catalog grid */
          .catalog {
            max-width: 1300px;
            margin: -80px auto 80px;
            padding: 0 24px;
          }

          .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 3rem 0 1.5rem 0.5rem;
            color: var(--navy-deep);
            border-left: 8px solid var(--allsafe-blue);
            padding-left: 1.5rem;
          }
          .section-title.shonet-title {
            border-left-color: var(--shonet-green);
          }
          .section-title.utility-title {
            border-left-color: var(--accent-amber);
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }

          .product-card {
            background: var(--card-bg);
            border-radius: var(--radius-card);
            padding: 2rem 1.8rem 2rem;
            box-shadow: var(--cool-shadow);
            border: 1px solid var(--border-soft);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
          }
          .product-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 28px 40px -12px #143650;
          }
          .product-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 6px;
            background: var(--card-accent, var(--allsafe-blue));
          }

          .card-badge {
            font-size: 0.7rem;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--card-accent, var(--allsafe-blue));
            margin-bottom: 1rem;
          }

          .product-card h3 {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 0.75rem;
            line-height: 1.2;
          }

          .product-desc {
            color: var(--text-muted);
            margin: 0.5rem 0 1.5rem;
            font-size: 0.98rem;
            flex: 1;
          }

          .link-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem 1.2rem;
            margin-top: 1rem;
            align-items: center;
          }
          .link-group a {
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border-bottom: 2px solid transparent;
            transition: border-color 0.1s;
          }
          .link-group a:hover {
            border-bottom-color: currentColor;
          }

          .primary-link {
            color: var(--card-accent, var(--allsafe-blue));
            font-weight: 700;
          }
          .external-link {
            color: var(--text-muted);
          }
          .pill-tag {
            background: #e2ebf6;
            padding: 0.2rem 1rem;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--navy-mid);
          }

          /* color variants */
          .card-allsafe { --card-accent: #1d4ed8; }
          .card-shonet { --card-accent: #0f766e; }
          .card-tool { --card-accent: #b45309; }
          .card-docs { --card-accent: #4b5563; }

          /* footer */
          footer {
            background: var(--navy-deep);
            color: white;
            padding: 70px 8% 30px;
            margin-top: 70px;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.8fr;
            gap: 3rem;
            padding-bottom: 3rem;
            border-bottom: 1px solid #1f4a6b;
          }
          .footer-col h5 {
            color: #9eb9e0;
            font-size: 0.8rem;
            letter-spacing: 1.5px;
            margin-bottom: 1.5rem;
          }
          .footer-col ul { list-style: none; }
          .footer-col li { margin-bottom: 0.8rem; }
          .footer-col a { color: #c5dbff; text-decoration: none; }
          .admin-card {
            background: #0e2842;
            padding: 1.8rem;
            border-radius: 1.8rem;
            border: 1px solid #28527a;
          }

          @media (max-width: 700px) {
            .nav-links { display: none; }
            .product-grid { grid-template-columns: 1fr; }
          }
        `
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "#",
                        className: "logo",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "logo-box"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 284,
                                columnNumber: 11
                            }, this),
                            "ALLSAFEX"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 283,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "nav-links",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#allsafe-access",
                                children: "Allsafe‑Access"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 288,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#allsafe-auth",
                                children: "allsafe‑auth"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 289,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#allsafe-flow",
                                children: "allsafe‑flow"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#shonet",
                                children: "Shonet RMS"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 291,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#otp",
                                children: "allsafe‑otp"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 292,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 287,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                lineNumber: 282,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "hero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: [
                            "Unified Allsafe‑Access &",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 297,
                                columnNumber: 37
                            }, this),
                            "balanced product ecosystem"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 297,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "sub",
                        children: "PyPI · npm · live domains · all documentation linked"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 298,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'center'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "domain-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "domain-item",
                                    children: [
                                        "🔵 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://allsafe-access.allsafex.com",
                                            target: "_blank",
                                            rel: "noopener",
                                            children: "allsafe‑access.allsafex.com"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 302,
                                            columnNumber: 46
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 302,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "domain-item",
                                    children: [
                                        "🟢 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://shonet.allsafex.com",
                                            target: "_blank",
                                            rel: "noopener",
                                            children: "shonet.allsafex.com"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 303,
                                            columnNumber: 46
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 303,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "domain-item",
                                    children: [
                                        "📦 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://pypi.org/project/allsafe-auth/",
                                            target: "_blank",
                                            rel: "noopener",
                                            children: "pypi.org/allsafe-auth"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 304,
                                            columnNumber: 46
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 304,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "domain-item",
                                    children: [
                                        "⚙️ ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://www.npmjs.com/package/allsafe-flow",
                                            target: "_blank",
                                            rel: "noopener",
                                            children: "npmjs/allsafe-flow"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 305,
                                            columnNumber: 46
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 305,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "domain-item",
                                    children: [
                                        "🔑 ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://pypi.org/project/allsafe-otp/",
                                            target: "_blank",
                                            rel: "noopener",
                                            children: "pypi.org/allsafe-otp"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 306,
                                            columnNumber: 46
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 306,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                            lineNumber: 301,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 300,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                lineNumber: 296,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "catalog",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "section-title",
                        id: "allsafe-access",
                        children: "🛡️ Allsafe‑Access suite (unified)"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "product-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-allsafe",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "🚪 CENTRAL GATEWAY"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 317,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "allsafe‑proxy"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 318,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Secure intermediary: agent management, mTLS, RBAC, audit logs, session relay."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 319,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "https://www.allsafex.com/docs/allsafe-proxy/overview",
                                                target: "_blank",
                                                rel: "noopener",
                                                className: "primary-link",
                                                children: "documentation →"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 321,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "pill-tag",
                                                children: "core"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 322,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 320,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-allsafe",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "💻 USER INTERFACE"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 328,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "allsafe‑cli"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 329,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Interactive shell, MFA, agent discovery, auto‑completion, session management."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 330,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://www.allsafex.com/docs/allsafe-cli/overview",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "documentation →"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 332,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 331,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 327,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-allsafe",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "📡 REMOTE NODE"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 338,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "allsafe‑agent"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 339,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Installed on remote machines, registers with proxy, enables secure shell sessions."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 340,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://www.allsafex.com/docs/allsafe-agent/overview",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "documentation →"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 342,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 341,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 337,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-allsafe",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "🛠️ ADMIN TOOL"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 348,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "allsafe‑admin"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Manage users, active sessions, audit logs, and system configuration."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 350,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://www.allsafex.com/docs/allsafe-admin/overview",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "documentation →"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 352,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 347,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "section-title",
                        id: "allsafe-auth",
                        children: "🔐 allsafe‑auth (PyPI)"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 358,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "product-grid",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "product-card card-allsafe",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-badge",
                                    children: "📦 PYPI · v1.1.8"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 361,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    children: "allsafe‑auth"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 362,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "product-desc",
                                    children: "TOTP, HOTP, Active Directory (LDAP), QR generator, Django + Inertia integration. One library."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 363,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "link-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://pypi.org/project/allsafe-auth/",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "PyPI →"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 365,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://allsafe-access.allsafex.com/docs/auth",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "external-link",
                                            children: "docs"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 366,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "pill-tag",
                                            children: "MIT"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 367,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 364,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: '0.8rem',
                                        fontSize: '0.85rem',
                                        color: '#3d6184'
                                    },
                                    children: "maintainer: Daniel Destaw"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 369,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                            lineNumber: 360,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 359,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "section-title",
                        id: "allsafe-flow",
                        children: "⚙️ allsafe‑flow (npm)"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 374,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "product-grid",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "product-card card-tool",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-badge",
                                    children: "⚙️ NPM · v1.1.4"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 377,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    children: "allsafe‑flow"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 378,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "product-desc",
                                    children: "Declarative service orchestration: YAML, colored logs, health checks, start/stop/restart."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 379,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "link-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://www.npmjs.com/package/allsafe-flow",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "npm →"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 381,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://allsafe-access.allsafex.com/docs/flow",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "external-link",
                                            children: "CLI docs"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 382,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "pill-tag",
                                            children: "devtools"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 383,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 380,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                            lineNumber: 376,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 375,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "section-title shonet-title",
                        id: "shonet",
                        children: "🍽️ Shonet RMS (hospitality)"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 389,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "product-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-shonet",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "🏬 WINDOWS POS"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 393,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Shonet Master"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 394,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Zero‑internet POS, offline database, LAN sync to waiter apps."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 395,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "https://shonet.allsafex.com",
                                                target: "_blank",
                                                rel: "noopener",
                                                className: "primary-link",
                                                children: "shonet.allsafex.com →"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 397,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "pill-tag",
                                                children: "live"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 398,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 396,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 392,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-shonet",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "📱 ANDROID APK"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 403,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Shonet Waiter"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 404,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Order taking, table management, works offline, syncs via LAN."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 405,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://shonet.allsafex.com/waiter",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "download APK →"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 407,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 406,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 402,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-shonet",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "🍳 KITCHEN"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 412,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Kitchen Display"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 413,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Real‑time orders, prep times, no internet needed."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 414,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://shonet.allsafex.com/kitchen",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "view demo"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 416,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 415,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 411,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-shonet",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "📊 REPORTING"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 421,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Analytics Hub"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 422,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Sales, item popularity, export reports — on‑prem."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 423,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://shonet.allsafex.com/analytics",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "insights"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 425,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 424,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 420,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 390,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "section-title utility-title",
                        id: "otp",
                        children: "🔑 2FA & utilities"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 431,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "product-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-tool",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "📀 PYPI · v0.1.1"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 435,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "allsafe‑otp"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 436,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Lightweight TOTP + QR generator. Simple 2FA for Python apps."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 437,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "https://pypi.org/project/allsafe-otp/",
                                                target: "_blank",
                                                rel: "noopener",
                                                className: "primary-link",
                                                children: "PyPI"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 439,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "#",
                                                className: "external-link",
                                                children: "generate_otp"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 440,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 438,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 434,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "product-card card-docs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-badge",
                                        children: "📘 DOCS"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 445,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Allsafe Docs"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 446,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "product-desc",
                                        children: "Full documentation for all modules: auth, proxy, CLI, agent, flow."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 447,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "link-group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://allsafe-access.allsafex.com/docs",
                                            target: "_blank",
                                            rel: "noopener",
                                            className: "primary-link",
                                            children: "visit docs"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 449,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 448,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 444,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 432,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            justifyContent: 'center',
                            margin: '4rem 0 1rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://pypi.org/project/allsafe-auth/",
                                style: {
                                    background: '#1d4ed8',
                                    color: 'white',
                                    padding: '0.8rem 2.2rem',
                                    borderRadius: '60px',
                                    textDecoration: 'none',
                                    fontWeight: 700
                                },
                                children: "📦 allsafe-auth 1.1.8 (PyPI)"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 456,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://www.npmjs.com/package/allsafe-flow",
                                style: {
                                    background: '#b45309',
                                    color: 'white',
                                    padding: '0.8rem 2.2rem',
                                    borderRadius: '60px',
                                    textDecoration: 'none',
                                    fontWeight: 700
                                },
                                children: "⚙️ allsafe-flow 1.1.4 (npm)"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 457,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://pypi.org/project/allsafe-otp/",
                                style: {
                                    background: '#0f766e',
                                    color: 'white',
                                    padding: '0.8rem 2.2rem',
                                    borderRadius: '60px',
                                    textDecoration: 'none',
                                    fontWeight: 700
                                },
                                children: "🔑 allsafe-otp 0.1.1"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 458,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 455,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                lineNumber: 311,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "footer-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "footer-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "logo",
                                        style: {
                                            marginBottom: '1rem',
                                            fontSize: '1.8rem'
                                        },
                                        children: "ALLSAFEX"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 466,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: '#a8c9ff'
                                        },
                                        children: "Balanced product ecosystem — Allsafe‑Access, allsafe‑auth, allsafe‑flow, Shonet RMS."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 467,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 465,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "footer-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                        children: "ALLSAFE‑ACCESS"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 470,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://www.allsafex.com/docs/allsafe-proxy/overview",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-proxy"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 472,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 472,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://www.allsafex.com/docs/allsafe-cli/overview",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-cli"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 473,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 473,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://www.allsafex.com/docs/allsafe-agent/overview",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-agent"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 474,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 474,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://www.allsafex.com/docs/allsafe-admin/overview",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 475,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 475,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 471,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 469,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "footer-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                        children: "PACKAGES"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 479,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://pypi.org/project/allsafe-auth/",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-auth (PyPI)"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 481,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 481,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://www.npmjs.com/package/allsafe-flow",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-flow (npm)"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 482,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 482,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://pypi.org/project/allsafe-otp/",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "allsafe-otp (PyPI)"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 483,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 483,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: "https://shonet.allsafex.com",
                                                    target: "_blank",
                                                    rel: "noopener",
                                                    children: "Shonet RMS"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                    lineNumber: 484,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                                lineNumber: 484,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                        lineNumber: 480,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "footer-col",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "admin-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                            style: {
                                                color: 'white'
                                            },
                                            children: "Principal Engineer"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 489,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '1.4rem',
                                                fontWeight: 700
                                            },
                                            children: "Daniel Destaw"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 490,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 490,
                                            columnNumber: 89
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "mailto:daniel.destaw@allsafex.com",
                                            children: "daniel.destaw@allsafex.com"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 491,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                marginTop: '1rem'
                                            },
                                            children: "📞 0988886692"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 492,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '0.8rem',
                                                color: '#93b9ff'
                                            },
                                            children: "maintainer of allsafe‑auth & allsafe‑flow"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                            lineNumber: 493,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                    lineNumber: 488,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                                lineNumber: 487,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 464,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$allsafe$2d$parents$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            marginTop: '2.5rem',
                            color: '#6f9ad0'
                        },
                        children: "© 2026 Allsafex — all products linked with accurate documentation."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                        lineNumber: 497,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/allsafe-parents/pages/index.js",
                lineNumber: 463,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/Desktop/allsafe-parents/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/Desktop/allsafe-parents/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/Desktop/allsafe-parents/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/Desktop/allsafe-parents/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__4ac74c7d._.js.map