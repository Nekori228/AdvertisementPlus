
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached if target is not <head>
        let children = target.childNodes;
        // If target is <head>, there may be children without claim_order
        if (target.nodeName === 'HEAD') {
            const myChildren = [];
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                if (node.claim_order !== undefined) {
                    myChildren.push(node);
                }
            }
            children = myChildren;
        }
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            // with fast path for when we are on the current longest subsequence
            const seqLen = ((longest > 0 && children[m[longest]].claim_order <= current) ? longest + 1 : upper_bound(1, longest, idx => children[m[idx]].claim_order, current)) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function append_hydration(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentNode !== target))) {
                target.actual_end_child = target.firstChild;
            }
            // Skip nodes of undefined ordering
            while ((target.actual_end_child !== null) && (target.actual_end_child.claim_order === undefined)) {
                target.actual_end_child = target.actual_end_child.nextSibling;
            }
            if (node !== target.actual_end_child) {
                // We only insert if the ordering of this node should be modified or the parent node is not target
                if (node.claim_order !== undefined || node.parentNode !== target) {
                    target.insertBefore(node, target.actual_end_child);
                }
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target || node.nextSibling !== null) {
            target.appendChild(node);
        }
    }
    function insert_hydration(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append_hydration(target, node);
        }
        else if (node.parentNode !== target || node.nextSibling != anchor) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function init_claim_info(nodes) {
        if (nodes.claim_info === undefined) {
            nodes.claim_info = { last_index: 0, total_claimed: 0 };
        }
    }
    function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
        // Try to find nodes in an order such that we lengthen the longest increasing subsequence
        init_claim_info(nodes);
        const resultNode = (() => {
            // We first try to find an element after the previous one
            for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
                const node = nodes[i];
                if (predicate(node)) {
                    const replacement = processNode(node);
                    if (replacement === undefined) {
                        nodes.splice(i, 1);
                    }
                    else {
                        nodes[i] = replacement;
                    }
                    if (!dontUpdateLastIndex) {
                        nodes.claim_info.last_index = i;
                    }
                    return node;
                }
            }
            // Otherwise, we try to find one before
            // We iterate in reverse so that we don't go too far back
            for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
                const node = nodes[i];
                if (predicate(node)) {
                    const replacement = processNode(node);
                    if (replacement === undefined) {
                        nodes.splice(i, 1);
                    }
                    else {
                        nodes[i] = replacement;
                    }
                    if (!dontUpdateLastIndex) {
                        nodes.claim_info.last_index = i;
                    }
                    else if (replacement === undefined) {
                        // Since we spliced before the last_index, we decrease it
                        nodes.claim_info.last_index--;
                    }
                    return node;
                }
            }
            // If we can't find any matching node, we create a new one
            return createNode();
        })();
        resultNode.claim_order = nodes.claim_info.total_claimed;
        nodes.claim_info.total_claimed += 1;
        return resultNode;
    }
    function claim_element_base(nodes, name, attributes, create_element) {
        return claim_node(nodes, (node) => node.nodeName === name, (node) => {
            const remove = [];
            for (let j = 0; j < node.attributes.length; j++) {
                const attribute = node.attributes[j];
                if (!attributes[attribute.name]) {
                    remove.push(attribute.name);
                }
            }
            remove.forEach(v => node.removeAttribute(v));
            return undefined;
        }, () => create_element(name));
    }
    function claim_element(nodes, name, attributes) {
        return claim_element_base(nodes, name, attributes, element);
    }
    function claim_text(nodes, data) {
        return claim_node(nodes, (node) => node.nodeType === 3, (node) => {
            const dataStr = '' + data;
            if (node.data.startsWith(dataStr)) {
                if (node.data.length !== dataStr.length) {
                    return node.splitText(dataStr.length);
                }
            }
            else {
                node.data = dataStr;
            }
        }, () => text(data), true // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
        );
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_hydration_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append_hydration(target, node);
    }
    function insert_hydration_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert_hydration(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) => pathname + (query ? `?${query}` : "");
    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    const resolve = (to, base) => {
        // /foo/bar, /baz/qux => /foo/bar
        if (to.startsWith("/")) return to;

        const [toPathname, toQuery] = to.split("?");
        const [basePathname] = base.split("?");
        const toSegments = segmentize(toPathname);
        const baseSegments = segmentize(basePathname);

        // ?a=b, /users?b=c => /users?a=b
        if (toSegments[0] === "") return addQuery(basePathname, toQuery);

        // profile, /users/789 => /users/789/profile

        if (!toSegments[0].startsWith(".")) {
            const pathname = baseSegments.concat(toSegments).join("/");
            return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
        }

        // ./       , /users/123 => /users/123
        // ../      , /users/123 => /users
        // ../..    , /users/123 => /
        // ../../one, /a/b/c/d   => /a/b/one
        // .././one , /a/b/c/d   => /a/b/c/one
        const allSegments = baseSegments.concat(toSegments);
        const segments = [];

        allSegments.forEach((segment) => {
            if (segment === "..") segments.pop();
            else if (segment !== ".") segments.push(segment);
        });

        return addQuery("/" + segments.join("/"), toQuery);
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    const shouldNavigate = (event) =>
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.59.2 */
    const file$i = "node_modules/svelte-routing/src/Link.svelte";
    const get_default_slot_changes$2 = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context$2 = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$j(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context$2);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file$i, 41, 0, 1414);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, ariaCurrent*/ 65540)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps","preserveScroll"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	let { preserveScroll = false } = $$props;
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(15, $base = value));
    	const { navigate } = getContext(HISTORY);
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	const onClick = event => {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, {
    				state,
    				replace: shouldReplace,
    				preserveScroll
    			});
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('preserveScroll' in $$new_props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ('$$scope' in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		location,
    		base,
    		navigate,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(12, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(13, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 32896) {
    			$$invalidate(0, href = resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(12, isPartiallyCurrent = $location.pathname.startsWith(href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		$$invalidate(1, props = getProps({
    			location: $location,
    			href,
    			isPartiallyCurrent,
    			isCurrent,
    			existingProps: $$restProps
    		}));
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		base,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10,
    			preserveScroll: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get preserveScroll() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preserveScroll(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_hydration_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if component}
    function create_if_block_1$2(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			await_block_anchor = empty();
    			info.block.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(43:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_hydration_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_hydration_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		canUseDOM,
    		path,
    		component,
    		routeParams,
    		routeProps,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		route,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { path: 6, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                if(blurActiveElement) document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$h = "node_modules/svelte-routing/src/Router.svelte";

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (143:0) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(143:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:0) {#if viewtransition}
    function create_if_block$3(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			key_block.l(nodes);
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_hydration_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(134:0) {#if viewtransition}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#key $location.pathname}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(div, file$h, 135, 8, 4659);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(135:4) {#key $location.pathname}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewtransition*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_hydration_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		setContext,
    		derived,
    		writable,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		combinePaths,
    		pick,
    		basepath,
    		url,
    		viewtransition,
    		history,
    		viewtransitionFn,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		preserveScroll,
    		$location,
    		$routes,
    		$base,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 8192) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewtransition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewtransition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.59.2 */
    const file$g = "src/components/Modal.svelte";

    // (14:0) {#if isOpen}
    function create_if_block$2(ctx) {
    	let div15;
    	let div14;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div13;
    	let p0;
    	let t1;
    	let br;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let div12;
    	let div3;
    	let div0;
    	let t6;
    	let t7;
    	let div1;
    	let t8;
    	let t9;
    	let div2;
    	let t10;
    	let t11;
    	let div11;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let div10;
    	let div6;
    	let img3;
    	let img3_src_value;
    	let t14;
    	let div7;
    	let img4;
    	let img4_src_value;
    	let t15;
    	let div8;
    	let img5;
    	let img5_src_value;
    	let t16;
    	let div9;
    	let img6;
    	let img6_src_value;
    	let t17;
    	let button;
    	let p2;
    	let t18;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div15 = element("div");
    			div14 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div13 = element("div");
    			p0 = element("p");
    			t1 = text("Закажите услугу напрямую");
    			br = element("br");
    			t2 = text("у производителя!");
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Контакты");
    			t5 = space();
    			div12 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t6 = text("+7 (123) 456-7890");
    			t7 = space();
    			div1 = element("div");
    			t8 = text("+7 (987) 654-3210");
    			t9 = space();
    			div2 = element("div");
    			t10 = text("+7 (987) 654-3210");
    			t11 = space();
    			div11 = element("div");
    			div4 = element("div");
    			img1 = element("img");
    			t12 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t13 = space();
    			div10 = element("div");
    			div6 = element("div");
    			img3 = element("img");
    			t14 = space();
    			div7 = element("div");
    			img4 = element("img");
    			t15 = space();
    			div8 = element("div");
    			img5 = element("img");
    			t16 = space();
    			div9 = element("div");
    			img6 = element("img");
    			t17 = space();
    			button = element("button");
    			p2 = element("p");
    			t18 = text("Спасибо");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div15 = claim_element(nodes, "DIV", { class: true });
    			var div15_nodes = children(div15);
    			div14 = claim_element(div15_nodes, "DIV", { class: true });
    			var div14_nodes = children(div14);
    			img0 = claim_element(div14_nodes, "IMG", { class: true, src: true });
    			t0 = claim_space(div14_nodes);
    			div13 = claim_element(div14_nodes, "DIV", { class: true });
    			var div13_nodes = children(div13);
    			p0 = claim_element(div13_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t1 = claim_text(p0_nodes, "Закажите услугу напрямую");
    			br = claim_element(p0_nodes, "BR", {});
    			t2 = claim_text(p0_nodes, "у производителя!");
    			p0_nodes.forEach(detach_dev);
    			t3 = claim_space(div13_nodes);
    			p1 = claim_element(div13_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t4 = claim_text(p1_nodes, "Контакты");
    			p1_nodes.forEach(detach_dev);
    			t5 = claim_space(div13_nodes);
    			div12 = claim_element(div13_nodes, "DIV", { class: true });
    			var div12_nodes = children(div12);
    			div3 = claim_element(div12_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div0 = claim_element(div3_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			t6 = claim_text(div0_nodes, "+7 (123) 456-7890");
    			div0_nodes.forEach(detach_dev);
    			t7 = claim_space(div3_nodes);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			t8 = claim_text(div1_nodes, "+7 (987) 654-3210");
    			div1_nodes.forEach(detach_dev);
    			t9 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			t10 = claim_text(div2_nodes, "+7 (987) 654-3210");
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t11 = claim_space(div12_nodes);
    			div11 = claim_element(div12_nodes, "DIV", { class: true });
    			var div11_nodes = children(div11);
    			div4 = claim_element(div11_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			img1 = claim_element(div4_nodes, "IMG", { src: true });
    			div4_nodes.forEach(detach_dev);
    			t12 = claim_space(div11_nodes);
    			div5 = claim_element(div11_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			img2 = claim_element(div5_nodes, "IMG", { src: true });
    			div5_nodes.forEach(detach_dev);
    			t13 = claim_space(div11_nodes);
    			div10 = claim_element(div11_nodes, "DIV", { class: true });
    			var div10_nodes = children(div10);
    			div6 = claim_element(div10_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			img3 = claim_element(div6_nodes, "IMG", { src: true });
    			div6_nodes.forEach(detach_dev);
    			t14 = claim_space(div10_nodes);
    			div7 = claim_element(div10_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			img4 = claim_element(div7_nodes, "IMG", { src: true });
    			div7_nodes.forEach(detach_dev);
    			t15 = claim_space(div10_nodes);
    			div8 = claim_element(div10_nodes, "DIV", { class: true });
    			var div8_nodes = children(div8);
    			img5 = claim_element(div8_nodes, "IMG", { src: true });
    			div8_nodes.forEach(detach_dev);
    			t16 = claim_space(div10_nodes);
    			div9 = claim_element(div10_nodes, "DIV", { class: true });
    			var div9_nodes = children(div9);
    			img6 = claim_element(div9_nodes, "IMG", { src: true });
    			div9_nodes.forEach(detach_dev);
    			div10_nodes.forEach(detach_dev);
    			div11_nodes.forEach(detach_dev);
    			div12_nodes.forEach(detach_dev);
    			t17 = claim_space(div13_nodes);
    			button = claim_element(div13_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			p2 = claim_element(button_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t18 = claim_text(p2_nodes, "Спасибо");
    			p2_nodes.forEach(detach_dev);
    			button_nodes.forEach(detach_dev);
    			div13_nodes.forEach(detach_dev);
    			div14_nodes.forEach(detach_dev);
    			div15_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img0, "class", "modal-image svelte-36ih2z");
    			if (!src_url_equal(img0.src, img0_src_value = "img/backModal2.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$g, 16, 12, 382);
    			add_location(br, file$g, 19, 44, 555);
    			attr_dev(p0, "class", "modal-main svelte-36ih2z");
    			add_location(p0, file$g, 18, 16, 488);
    			attr_dev(p1, "class", "modal-second svelte-36ih2z");
    			add_location(p1, file$g, 21, 16, 615);
    			attr_dev(div0, "class", "phone-number svelte-36ih2z");
    			add_location(div0, file$g, 24, 24, 763);
    			attr_dev(div1, "class", "phone-number svelte-36ih2z");
    			add_location(div1, file$g, 25, 24, 837);
    			attr_dev(div2, "class", "phone-number svelte-36ih2z");
    			add_location(div2, file$g, 26, 24, 911);
    			attr_dev(div3, "class", "block phones svelte-36ih2z");
    			add_location(div3, file$g, 23, 20, 712);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/icon/phone.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$g, 30, 28, 1109);
    			attr_dev(div4, "class", "app-icon svelte-36ih2z");
    			add_location(div4, file$g, 29, 24, 1058);
    			if (!src_url_equal(img2.src, img2_src_value = "/img/icon/mail2.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$g, 33, 28, 1249);
    			attr_dev(div5, "class", "app-icon svelte-36ih2z");
    			add_location(div5, file$g, 32, 24, 1198);
    			if (!src_url_equal(img3.src, img3_src_value = "/img/icon/tgBrown.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$g, 37, 32, 1448);
    			attr_dev(div6, "class", "app-icon svelte-36ih2z");
    			add_location(div6, file$g, 36, 28, 1393);
    			if (!src_url_equal(img4.src, img4_src_value = "/img/icon/viderBrown.svg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$g, 40, 32, 1602);
    			attr_dev(div7, "class", "app-icon svelte-36ih2z");
    			add_location(div7, file$g, 39, 28, 1547);
    			if (!src_url_equal(img5.src, img5_src_value = "/img/icon/watsappBrown.svg")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$g, 43, 32, 1759);
    			attr_dev(div8, "class", "app-icon svelte-36ih2z");
    			add_location(div8, file$g, 42, 28, 1704);
    			if (!src_url_equal(img6.src, img6_src_value = "/img/icon/phone.svg")) attr_dev(img6, "src", img6_src_value);
    			add_location(img6, file$g, 46, 32, 1918);
    			attr_dev(div9, "class", "app-icon svelte-36ih2z");
    			add_location(div9, file$g, 45, 28, 1863);
    			attr_dev(div10, "class", "row-position svelte-36ih2z");
    			add_location(div10, file$g, 35, 24, 1338);
    			attr_dev(div11, "class", "block icons svelte-36ih2z");
    			add_location(div11, file$g, 28, 20, 1008);
    			attr_dev(div12, "class", "container svelte-36ih2z");
    			add_location(div12, file$g, 22, 16, 668);
    			attr_dev(p2, "class", "button-thanks svelte-36ih2z");
    			add_location(p2, file$g, 52, 21, 2160);
    			attr_dev(button, "class", "turquoise-button svelte-36ih2z");
    			add_location(button, file$g, 51, 16, 2084);
    			attr_dev(div13, "class", "modal-body svelte-36ih2z");
    			add_location(div13, file$g, 17, 12, 447);
    			attr_dev(div14, "class", "modal-content svelte-36ih2z");
    			add_location(div14, file$g, 15, 8, 317);
    			attr_dev(div15, "class", "modal-overlay svelte-36ih2z");
    			add_location(div15, file$g, 14, 4, 259);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div15, anchor);
    			append_hydration_dev(div15, div14);
    			append_hydration_dev(div14, img0);
    			append_hydration_dev(div14, t0);
    			append_hydration_dev(div14, div13);
    			append_hydration_dev(div13, p0);
    			append_hydration_dev(p0, t1);
    			append_hydration_dev(p0, br);
    			append_hydration_dev(p0, t2);
    			append_hydration_dev(div13, t3);
    			append_hydration_dev(div13, p1);
    			append_hydration_dev(p1, t4);
    			append_hydration_dev(div13, t5);
    			append_hydration_dev(div13, div12);
    			append_hydration_dev(div12, div3);
    			append_hydration_dev(div3, div0);
    			append_hydration_dev(div0, t6);
    			append_hydration_dev(div3, t7);
    			append_hydration_dev(div3, div1);
    			append_hydration_dev(div1, t8);
    			append_hydration_dev(div3, t9);
    			append_hydration_dev(div3, div2);
    			append_hydration_dev(div2, t10);
    			append_hydration_dev(div12, t11);
    			append_hydration_dev(div12, div11);
    			append_hydration_dev(div11, div4);
    			append_hydration_dev(div4, img1);
    			append_hydration_dev(div11, t12);
    			append_hydration_dev(div11, div5);
    			append_hydration_dev(div5, img2);
    			append_hydration_dev(div11, t13);
    			append_hydration_dev(div11, div10);
    			append_hydration_dev(div10, div6);
    			append_hydration_dev(div6, img3);
    			append_hydration_dev(div10, t14);
    			append_hydration_dev(div10, div7);
    			append_hydration_dev(div7, img4);
    			append_hydration_dev(div10, t15);
    			append_hydration_dev(div10, div8);
    			append_hydration_dev(div8, img5);
    			append_hydration_dev(div10, t16);
    			append_hydration_dev(div10, div9);
    			append_hydration_dev(div9, img6);
    			append_hydration_dev(div13, t17);
    			append_hydration_dev(div13, button);
    			append_hydration_dev(button, p2);
    			append_hydration_dev(p2, t18);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*closeModal*/ ctx[1], false, false, false, false),
    					listen_dev(div14, "click", stop_propagation(/*click_handler*/ ctx[3]), false, false, true, false),
    					listen_dev(div15, "click", /*closeModal*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div15);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(14:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let if_block_anchor;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_hydration_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, []);
    	let { isOpen = false } = $$props;
    	let { content = "" } = $$props;
    	const dispatch = createEventDispatcher();

    	function closeModal() {
    		dispatch("close");
    	}

    	const writable_props = ['isOpen', 'content'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ('content' in $$props) $$invalidate(2, content = $$props.content);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		isOpen,
    		content,
    		dispatch,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ('content' in $$props) $$invalidate(2, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isOpen, closeModal, content, click_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { isOpen: 0, content: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.59.2 */
    const file$f = "src/components/Header.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (69:4) {#if isMenuOpen}
    function create_if_block_1$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			children(div).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "overlay svelte-nsxe6a");
    			add_location(div, file$f, 69, 8, 1537);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*closeMenu*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(69:4) {#if isMenuOpen}",
    		ctx
    	});

    	return block;
    }

    // (99:16) {#if item.open}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let ul;
    	let t;
    	let each_value_1 = /*item*/ ctx[11].content;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			ul = claim_element(div0_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(ul, "class", "svelte-nsxe6a");
    			add_location(ul, file$f, 101, 28, 2695);
    			attr_dev(div0, "class", "accordion-content svelte-nsxe6a");
    			add_location(div0, file$f, 100, 24, 2635);
    			attr_dev(div1, "class", "accordion-content-container svelte-nsxe6a");
    			add_location(div1, file$f, 99, 20, 2569);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div1, anchor);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_hydration_dev(div1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openModal, items*/ 136) {
    				each_value_1 = /*item*/ ctx[11].content;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(99:16) {#if item.open}",
    		ctx
    	});

    	return block;
    }

    // (103:32) {#each item.content as subitem}
    function create_each_block_1$1(ctx) {
    	let li;
    	let t0_value = /*subitem*/ ctx[14] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[10](/*subitem*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			t0 = claim_text(li_nodes, t0_value);
    			t1 = claim_space(li_nodes);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(li, "class", "svelte-nsxe6a");
    			add_location(li, file$f, 103, 36, 2800);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, li, anchor);
    			append_hydration_dev(li, t0);
    			append_hydration_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 8 && t0_value !== (t0_value = /*subitem*/ ctx[14] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(103:32) {#each item.content as subitem}",
    		ctx
    	});

    	return block;
    }

    // (83:12) {#each items as item, index}
    function create_each_block$3(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let t0;
    	let t1_value = /*item*/ ctx[11].title + "";
    	let t1;
    	let div1_class_value;
    	let t2;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*index*/ ctx[13]);
    	}

    	let if_block = /*item*/ ctx[11].open && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { class: true, src: true, alt: true });
    			t0 = claim_space(div0_nodes);
    			t1 = claim_text(div0_nodes, t1_value);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "class", img_class_value = "arrow " + (/*item*/ ctx[11].open ? 'open' : '') + " svelte-nsxe6a");
    			if (!src_url_equal(img.src, img_src_value = "/img/icon/arrow.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Arrow");
    			add_location(img, file$f, 90, 24, 2236);
    			attr_dev(div0, "class", "accordion-header svelte-nsxe6a");
    			add_location(div0, file$f, 89, 20, 2181);
    			attr_dev(div1, "class", div1_class_value = "accordion-header-container " + (/*item*/ ctx[11].open ? 'active' : '') + " svelte-nsxe6a");
    			add_location(div1, file$f, 83, 16, 1956);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div1, anchor);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div0, img);
    			append_hydration_dev(div0, t0);
    			append_hydration_dev(div0, t1);
    			insert_hydration_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_hydration_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*items*/ 8 && img_class_value !== (img_class_value = "arrow " + (/*item*/ ctx[11].open ? 'open' : '') + " svelte-nsxe6a")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*items*/ 8 && t1_value !== (t1_value = /*item*/ ctx[11].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*items*/ 8 && div1_class_value !== (div1_class_value = "accordion-header-container " + (/*item*/ ctx[11].open ? 'active' : '') + " svelte-nsxe6a")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (/*item*/ ctx[11].open) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(83:12) {#each items as item, index}",
    		ctx
    	});

    	return block;
    }

    // (118:12) <Link style="text-decoration: none;" to="Contact"                 >
    function create_default_slot_1$2(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text("Контакты");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t = claim_text(h2_nodes, "Контакты");
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "btnNav svelte-nsxe6a");
    			add_location(h2, file$f, 118, 17, 3330);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, h2, anchor);
    			append_hydration_dev(h2, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(118:12) <Link style=\\\"text-decoration: none;\\\" to=\\\"Contact\\\"                 >",
    		ctx
    	});

    	return block;
    }

    // (124:12) <Link style="text-decoration: none;" to="Portfolio"                 >
    function create_default_slot$2(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text("Портфолио");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t = claim_text(h2_nodes, "Портфолио");
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "btnNav svelte-nsxe6a");
    			add_location(h2, file$f, 124, 17, 3526);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, h2, anchor);
    			append_hydration_dev(h2, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(124:12) <Link style=\\\"text-decoration: none;\\\" to=\\\"Portfolio\\\"                 >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let head;
    	let t0;
    	let header;
    	let button0;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let nav;
    	let button1;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let div4;
    	let t6;
    	let img1;
    	let img1_src_value;
    	let t7;
    	let ul;
    	let li0;
    	let link0;
    	let t8;
    	let div5;
    	let t9;
    	let li1;
    	let link1;
    	let t10;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isMenuOpen*/ ctx[0] && create_if_block_1$1(ctx);
    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	link0 = new Link({
    			props: {
    				style: "text-decoration: none;",
    				to: "Contact",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				style: "text-decoration: none;",
    				to: "Portfolio",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal = new Modal({
    			props: {
    				isOpen: /*isModalOpen*/ ctx[1],
    				content: /*modalContent*/ ctx[2]
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*closeModal*/ ctx[8]);

    	const block = {
    		c: function create() {
    			head = element("head");
    			t0 = space();
    			header = element("header");
    			button0 = element("button");
    			div3 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			nav = element("nav");
    			button1 = element("button");
    			img0 = element("img");
    			t5 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			img1 = element("img");
    			t7 = space();
    			ul = element("ul");
    			li0 = element("li");
    			create_component(link0.$$.fragment);
    			t8 = space();
    			div5 = element("div");
    			t9 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t10 = space();
    			create_component(modal.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			head = claim_element(nodes, "HEAD", {});
    			var head_nodes = children(head);
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			button0 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			div3 = claim_element(button0_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div0 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t1 = claim_space(div3_nodes);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div1).forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div2).forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			t3 = claim_space(header_nodes);
    			if (if_block) if_block.l(header_nodes);
    			t4 = claim_space(header_nodes);
    			nav = claim_element(header_nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);
    			button1 = claim_element(nav_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);

    			img0 = claim_element(button1_nodes, "IMG", {
    				src: true,
    				width: true,
    				height: true,
    				alt: true
    			});

    			button1_nodes.forEach(detach_dev);
    			t5 = claim_space(nav_nodes);
    			div4 = claim_element(nav_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div4_nodes);
    			}

    			div4_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			t6 = claim_space(header_nodes);

    			img1 = claim_element(header_nodes, "IMG", {
    				src: true,
    				alt: true,
    				width: true,
    				height: true
    			});

    			t7 = claim_space(header_nodes);
    			ul = claim_element(header_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			claim_component(link0.$$.fragment, li0_nodes);
    			li0_nodes.forEach(detach_dev);
    			t8 = claim_space(ul_nodes);
    			div5 = claim_element(ul_nodes, "DIV", { class: true });
    			children(div5).forEach(detach_dev);
    			t9 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			claim_component(link1.$$.fragment, li1_nodes);
    			li1_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			t10 = claim_space(nodes);
    			claim_component(modal.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(head, file$f, 57, 0, 1266);
    			attr_dev(div0, "class", "svelte-nsxe6a");
    			add_location(div0, file$f, 62, 12, 1418);
    			attr_dev(div1, "class", "svelte-nsxe6a");
    			add_location(div1, file$f, 63, 12, 1442);
    			attr_dev(div2, "class", "svelte-nsxe6a");
    			add_location(div2, file$f, 64, 12, 1466);
    			attr_dev(div3, "class", "burger-menu svelte-nsxe6a");
    			toggle_class(div3, "open", /*isMenuOpen*/ ctx[0]);
    			add_location(div3, file$f, 61, 8, 1356);
    			attr_dev(button0, "class", "burger-button svelte-nsxe6a");
    			add_location(button0, file$f, 60, 4, 1295);
    			if (!src_url_equal(img0.src, img0_src_value = "/img/arrowMenu.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "25");
    			attr_dev(img0, "height", "25");
    			attr_dev(img0, "alt", "Закрыть");
    			add_location(img0, file$f, 74, 12, 1703);
    			attr_dev(button1, "class", "close-button svelte-nsxe6a");
    			add_location(button1, file$f, 73, 8, 1639);
    			attr_dev(div4, "class", "accordion svelte-nsxe6a");
    			add_location(div4, file$f, 81, 8, 1875);
    			attr_dev(nav, "class", "svelte-nsxe6a");
    			toggle_class(nav, "open", /*isMenuOpen*/ ctx[0]);
    			add_location(nav, file$f, 72, 4, 1601);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/logo_small.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "small logo");
    			attr_dev(img1, "width", "200");
    			attr_dev(img1, "height", "64");
    			add_location(img1, file$f, 114, 4, 3137);
    			add_location(li0, file$f, 116, 8, 3246);
    			attr_dev(div5, "class", "block1 svelte-nsxe6a");
    			add_location(div5, file$f, 121, 8, 3405);
    			add_location(li1, file$f, 122, 8, 3440);
    			attr_dev(ul, "class", "ulHeader svelte-nsxe6a");
    			add_location(ul, file$f, 115, 4, 3216);
    			attr_dev(header, "class", "svelte-nsxe6a");
    			add_location(header, file$f, 59, 0, 1282);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, head, anchor);
    			insert_hydration_dev(target, t0, anchor);
    			insert_hydration_dev(target, header, anchor);
    			append_hydration_dev(header, button0);
    			append_hydration_dev(button0, div3);
    			append_hydration_dev(div3, div0);
    			append_hydration_dev(div3, t1);
    			append_hydration_dev(div3, div1);
    			append_hydration_dev(div3, t2);
    			append_hydration_dev(div3, div2);
    			append_hydration_dev(header, t3);
    			if (if_block) if_block.m(header, null);
    			append_hydration_dev(header, t4);
    			append_hydration_dev(header, nav);
    			append_hydration_dev(nav, button1);
    			append_hydration_dev(button1, img0);
    			append_hydration_dev(nav, t5);
    			append_hydration_dev(nav, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div4, null);
    				}
    			}

    			append_hydration_dev(header, t6);
    			append_hydration_dev(header, img1);
    			append_hydration_dev(header, t7);
    			append_hydration_dev(header, ul);
    			append_hydration_dev(ul, li0);
    			mount_component(link0, li0, null);
    			append_hydration_dev(ul, t8);
    			append_hydration_dev(ul, div5);
    			append_hydration_dev(ul, t9);
    			append_hydration_dev(ul, li1);
    			mount_component(link1, li1, null);
    			insert_hydration_dev(target, t10, anchor);
    			mount_component(modal, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleMenu*/ ctx[4], false, false, false, false),
    					listen_dev(button1, "click", /*toggleMenu*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*isMenuOpen*/ 1) {
    				toggle_class(div3, "open", /*isMenuOpen*/ ctx[0]);
    			}

    			if (/*isMenuOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(header, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*items, openModal, toggle*/ 200) {
    				each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*isMenuOpen*/ 1) {
    				toggle_class(nav, "open", /*isMenuOpen*/ ctx[0]);
    			}

    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const modal_changes = {};
    			if (dirty & /*isModalOpen*/ 2) modal_changes.isOpen = /*isModalOpen*/ ctx[1];
    			if (dirty & /*modalContent*/ 4) modal_changes.content = /*modalContent*/ ctx[2];
    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(link0);
    			destroy_component(link1);
    			if (detaching) detach_dev(t10);
    			destroy_component(modal, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let isMenuOpen = false;
    	let isModalOpen = false;
    	let modalContent = "";

    	function toggleMenu() {
    		$$invalidate(0, isMenuOpen = !isMenuOpen);
    	}

    	function closeMenu() {
    		$$invalidate(0, isMenuOpen = false);
    	}

    	let items = [
    		{
    			title: "Услуги печати",
    			content: [
    				"Печать на баннере",
    				"Печать на сетке",
    				"Печать на самоклейке",
    				"Интерьерная печать"
    			],
    			open: false
    		},
    		{
    			title: "Вывески и таблички",
    			content: ["Item 2.1", "Item 2.2", "Item 2.3"],
    			open: false
    		},
    		{
    			title: "Прочие услуги",
    			content: ["Item 3.1", "Item 3.2", "Item 3.3"],
    			open: false
    		}
    	];

    	function toggle(index) {
    		$$invalidate(3, items = items.map((item, i) => ({
    			...item,
    			open: i === index ? !item.open : item.open
    		})));
    	}

    	function openModal(content) {
    		$$invalidate(2, modalContent = content);
    		$$invalidate(1, isModalOpen = true);
    	}

    	function closeModal() {
    		$$invalidate(1, isModalOpen = false);
    		$$invalidate(2, modalContent = "");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => toggle(index);
    	const click_handler_1 = subitem => openModal(subitem);

    	$$self.$capture_state = () => ({
    		Link,
    		Modal,
    		isMenuOpen,
    		isModalOpen,
    		modalContent,
    		toggleMenu,
    		closeMenu,
    		items,
    		toggle,
    		openModal,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('isMenuOpen' in $$props) $$invalidate(0, isMenuOpen = $$props.isMenuOpen);
    		if ('isModalOpen' in $$props) $$invalidate(1, isModalOpen = $$props.isModalOpen);
    		if ('modalContent' in $$props) $$invalidate(2, modalContent = $$props.modalContent);
    		if ('items' in $$props) $$invalidate(3, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isMenuOpen,
    		isModalOpen,
    		modalContent,
    		items,
    		toggleMenu,
    		closeMenu,
    		toggle,
    		openModal,
    		closeModal,
    		click_handler,
    		click_handler_1
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/MainLogo.svelte generated by Svelte v3.59.2 */

    const file$e = "src/components/MainLogo.svelte";

    function create_fragment$e(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let div4;
    	let div2;
    	let img;
    	let img_src_value;
    	let div3;
    	let t1;
    	let div6;
    	let div5;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div2 = element("div");
    			img = element("img");
    			div3 = element("div");
    			t1 = space();
    			div6 = element("div");
    			div5 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div1 = claim_element(main_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t0 = claim_space(main_nodes);
    			div4 = claim_element(main_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div2 = claim_element(div4_nodes, "DIV", { class: true });
    			children(div2).forEach(detach_dev);

    			img = claim_element(div4_nodes, "IMG", {
    				src: true,
    				alt: true,
    				width: true,
    				height: true
    			});

    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			children(div3).forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			div6 = claim_element(main_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			div5 = claim_element(div6_nodes, "DIV", { class: true });
    			children(div5).forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "box2 svelte-2ejcvg");
    			add_location(div0, file$e, 5, 20, 48);
    			attr_dev(div1, "class", "box1 svelte-2ejcvg");
    			add_location(div1, file$e, 5, 2, 30);
    			attr_dev(div2, "class", "box5 svelte-2ejcvg");
    			add_location(div2, file$e, 6, 29, 108);
    			if (!src_url_equal(img.src, img_src_value = "/img/logo_small.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "small logo");
    			attr_dev(img, "width", "850");
    			attr_dev(img, "height", "268");
    			add_location(img, file$e, 6, 53, 132);
    			attr_dev(div3, "class", "box6 svelte-2ejcvg");
    			add_location(div3, file$e, 6, 126, 205);
    			attr_dev(div4, "class", "imageLogoMain svelte-2ejcvg");
    			add_location(div4, file$e, 6, 2, 81);
    			attr_dev(div5, "class", "box4 svelte-2ejcvg");
    			add_location(div5, file$e, 7, 20, 256);
    			attr_dev(div6, "class", "box3 svelte-2ejcvg");
    			add_location(div6, file$e, 7, 2, 238);
    			attr_dev(main, "class", "svelte-2ejcvg");
    			add_location(main, file$e, 4, 0, 21);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, div1);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(main, t0);
    			append_hydration_dev(main, div4);
    			append_hydration_dev(div4, div2);
    			append_hydration_dev(div4, img);
    			append_hydration_dev(div4, div3);
    			append_hydration_dev(main, t1);
    			append_hydration_dev(main, div6);
    			append_hydration_dev(div6, div5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainLogo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainLogo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MainLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainLogo",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/BrendText.svelte generated by Svelte v3.59.2 */

    const file$d = "src/components/BrendText.svelte";

    function create_fragment$d(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let div1;
    	let p0;
    	let t3;
    	let t4;
    	let div0;
    	let t5;
    	let p1;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9;
    	let div7;
    	let div3;
    	let div2;
    	let t10;
    	let div4;
    	let t11;
    	let div5;
    	let t12;
    	let div6;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Создание рекламы по продвижению бренда,");
    			br = element("br");
    			t1 = text("изготовление и установка\n        всех видов рекламы");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t3 = text("Действует специальное предложение!");
    			t4 = space();
    			div0 = element("div");
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Сделаем и повесим световую вывеску за");
    			t7 = space();
    			p2 = element("p");
    			t8 = text("48 часов!");
    			t9 = space();
    			div7 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t10 = space();
    			div4 = element("div");
    			t11 = space();
    			div5 = element("div");
    			t12 = space();
    			div6 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			h1 = claim_element(main_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Создание рекламы по продвижению бренда,");
    			br = claim_element(h1_nodes, "BR", {});
    			t1 = claim_text(h1_nodes, "изготовление и установка\n        всех видов рекламы");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(main_nodes);
    			div1 = claim_element(main_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			p0 = claim_element(div1_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t3 = claim_text(p0_nodes, "Действует специальное предложение!");
    			p0_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t6 = claim_text(p1_nodes, "Сделаем и повесим световую вывеску за");
    			p1_nodes.forEach(detach_dev);
    			t7 = claim_space(div1_nodes);
    			p2 = claim_element(div1_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t8 = claim_text(p2_nodes, "48 часов!");
    			p2_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t9 = claim_space(main_nodes);
    			div7 = claim_element(main_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			div3 = claim_element(div7_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div2).forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t10 = claim_space(div7_nodes);
    			div4 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div4).forEach(detach_dev);
    			t11 = claim_space(div7_nodes);
    			div5 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div5).forEach(detach_dev);
    			t12 = claim_space(div7_nodes);
    			div6 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div6).forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(br, file$d, 2, 47, 63);
    			attr_dev(h1, "class", "svelte-exxfmk");
    			add_location(h1, file$d, 1, 4, 11);
    			attr_dev(p0, "class", "blackText svelte-exxfmk");
    			add_location(p0, file$d, 6, 8, 172);
    			attr_dev(div0, "class", "divBlock svelte-exxfmk");
    			add_location(div0, file$d, 7, 8, 240);
    			attr_dev(p1, "class", "blackText svelte-exxfmk");
    			add_location(p1, file$d, 8, 8, 277);
    			attr_dev(p2, "class", "redText svelte-exxfmk");
    			add_location(p2, file$d, 9, 8, 348);
    			attr_dev(div1, "class", "BlackContainer svelte-exxfmk");
    			add_location(div1, file$d, 5, 4, 135);
    			attr_dev(div2, "class", "box2 svelte-exxfmk");
    			add_location(div2, file$d, 12, 26, 455);
    			attr_dev(div3, "class", "box1 svelte-exxfmk");
    			add_location(div3, file$d, 12, 8, 437);
    			attr_dev(div4, "class", "box3 svelte-exxfmk");
    			add_location(div4, file$d, 13, 8, 494);
    			attr_dev(div5, "class", "box4 svelte-exxfmk");
    			add_location(div5, file$d, 14, 8, 527);
    			attr_dev(div6, "class", "box5 svelte-exxfmk");
    			add_location(div6, file$d, 15, 8, 560);
    			attr_dev(div7, "class", "background-element svelte-exxfmk");
    			add_location(div7, file$d, 11, 4, 396);
    			attr_dev(main, "class", "svelte-exxfmk");
    			add_location(main, file$d, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, h1);
    			append_hydration_dev(h1, t0);
    			append_hydration_dev(h1, br);
    			append_hydration_dev(h1, t1);
    			append_hydration_dev(main, t2);
    			append_hydration_dev(main, div1);
    			append_hydration_dev(div1, p0);
    			append_hydration_dev(p0, t3);
    			append_hydration_dev(div1, t4);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div1, t5);
    			append_hydration_dev(div1, p1);
    			append_hydration_dev(p1, t6);
    			append_hydration_dev(div1, t7);
    			append_hydration_dev(div1, p2);
    			append_hydration_dev(p2, t8);
    			append_hydration_dev(main, t9);
    			append_hydration_dev(main, div7);
    			append_hydration_dev(div7, div3);
    			append_hydration_dev(div3, div2);
    			append_hydration_dev(div7, t10);
    			append_hydration_dev(div7, div4);
    			append_hydration_dev(div7, t11);
    			append_hydration_dev(div7, div5);
    			append_hydration_dev(div7, t12);
    			append_hydration_dev(div7, div6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BrendText', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BrendText> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class BrendText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BrendText",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/WorkHMAO.svelte generated by Svelte v3.59.2 */

    const file$c = "src/components/WorkHMAO.svelte";

    function create_fragment$c(ctx) {
    	let main;
    	let h10;
    	let t0;
    	let t1;
    	let h11;
    	let t2;
    	let t3;
    	let div4;
    	let div1;
    	let div0;
    	let t4;
    	let div3;
    	let div2;
    	let p;
    	let t5;
    	let br;
    	let t6;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h10 = element("h1");
    			t0 = text("Работаем по ХМАО и ЯНАО");
    			t1 = space();
    			h11 = element("h1");
    			t2 = text("с 2003 года");
    			t3 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			p = element("p");
    			t5 = text("здесь будет фото основателей или ");
    			br = element("br");
    			t6 = text("фото самой компании");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			h10 = claim_element(main_nodes, "H1", { class: true });
    			var h10_nodes = children(h10);
    			t0 = claim_text(h10_nodes, "Работаем по ХМАО и ЯНАО");
    			h10_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			h11 = claim_element(main_nodes, "H1", { class: true });
    			var h11_nodes = children(h11);
    			t2 = claim_text(h11_nodes, "с 2003 года");
    			h11_nodes.forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			div4 = claim_element(main_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div1 = claim_element(div4_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t4 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			p = claim_element(div2_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t5 = claim_text(p_nodes, "здесь будет фото основателей или ");
    			br = claim_element(p_nodes, "BR", {});
    			t6 = claim_text(p_nodes, "фото самой компании");
    			p_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h10, "class", "h1Left svelte-1sgx4l2");
    			add_location(h10, file$c, 4, 4, 31);
    			attr_dev(h11, "class", "h1Rigt svelte-1sgx4l2");
    			add_location(h11, file$c, 5, 4, 83);
    			attr_dev(div0, "class", "box2 svelte-1sgx4l2");
    			add_location(div0, file$c, 7, 26, 182);
    			attr_dev(div1, "class", "box1 svelte-1sgx4l2");
    			add_location(div1, file$c, 7, 8, 164);
    			add_location(br, file$c, 11, 53, 362);
    			attr_dev(p, "class", "textInBox svelte-1sgx4l2");
    			add_location(p, file$c, 10, 16, 287);
    			attr_dev(div2, "class", "box4 svelte-1sgx4l2");
    			add_location(div2, file$c, 9, 12, 252);
    			attr_dev(div3, "class", "box3 svelte-1sgx4l2");
    			add_location(div3, file$c, 8, 8, 221);
    			attr_dev(div4, "class", "background-element svelte-1sgx4l2");
    			add_location(div4, file$c, 6, 4, 123);
    			attr_dev(main, "class", "svelte-1sgx4l2");
    			add_location(main, file$c, 3, 0, 20);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, h10);
    			append_hydration_dev(h10, t0);
    			append_hydration_dev(main, t1);
    			append_hydration_dev(main, h11);
    			append_hydration_dev(h11, t2);
    			append_hydration_dev(main, t3);
    			append_hydration_dev(main, div4);
    			append_hydration_dev(div4, div1);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div4, t4);
    			append_hydration_dev(div4, div3);
    			append_hydration_dev(div3, div2);
    			append_hydration_dev(div2, p);
    			append_hydration_dev(p, t5);
    			append_hydration_dev(p, br);
    			append_hydration_dev(p, t6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WorkHMAO', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WorkHMAO> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WorkHMAO extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WorkHMAO",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/Provide.svelte generated by Svelte v3.59.2 */

    const file$b = "src/components/Provide.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (22:16) {#each photos as photo}
    function create_each_block$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (!src_url_equal(img.src, img_src_value = /*photo*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*photo*/ ctx[1].alt);
    			attr_dev(img, "class", "svelte-1mqkxzz");
    			add_location(img, file$b, 22, 20, 901);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(22:16) {#each photos as photo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let div4;
    	let div1;
    	let h1;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let br4;
    	let t7;
    	let t8;
    	let div0;
    	let t9;
    	let p1;
    	let t10;
    	let t11;
    	let div3;
    	let div2;
    	let each_value = /*photos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div4 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text("Мы предоставляем");
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Размещение наружной рекламы");
    			br0 = element("br");
    			t3 = text("Печать баннеров и постеров");
    			br1 = element("br");
    			t4 = text("Внутреннее оформление");
    			br2 = element("br");
    			t5 = text("Реклама на транспорте");
    			br3 = element("br");
    			t6 = text("Крышные установки");
    			br4 = element("br");
    			t7 = text("Стелы");
    			t8 = space();
    			div0 = element("div");
    			t9 = space();
    			p1 = element("p");
    			t10 = text("И другие конструкции любой сложности.");
    			t11 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div4 = claim_element(main_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div1 = claim_element(div4_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h1 = claim_element(div1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Мы предоставляем");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			p0 = claim_element(div1_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t2 = claim_text(p0_nodes, "Размещение наружной рекламы");
    			br0 = claim_element(p0_nodes, "BR", {});
    			t3 = claim_text(p0_nodes, "Печать баннеров и постеров");
    			br1 = claim_element(p0_nodes, "BR", {});
    			t4 = claim_text(p0_nodes, "Внутреннее оформление");
    			br2 = claim_element(p0_nodes, "BR", {});
    			t5 = claim_text(p0_nodes, "Реклама на транспорте");
    			br3 = claim_element(p0_nodes, "BR", {});
    			t6 = claim_text(p0_nodes, "Крышные установки");
    			br4 = claim_element(p0_nodes, "BR", {});
    			t7 = claim_text(p0_nodes, "Стелы");
    			p0_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t9 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t10 = claim_text(p1_nodes, "И другие конструкции любой сложности.");
    			p1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t11 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div2_nodes);
    			}

    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1mqkxzz");
    			add_location(h1, file$b, 14, 12, 483);
    			add_location(br0, file$b, 15, 42, 551);
    			add_location(br1, file$b, 15, 72, 581);
    			add_location(br2, file$b, 15, 97, 606);
    			add_location(br3, file$b, 15, 122, 631);
    			add_location(br4, file$b, 15, 143, 652);
    			attr_dev(p0, "class", "svelte-1mqkxzz");
    			add_location(p0, file$b, 15, 12, 521);
    			attr_dev(div0, "class", "marginText svelte-1mqkxzz");
    			add_location(div0, file$b, 16, 12, 678);
    			attr_dev(p1, "class", "svelte-1mqkxzz");
    			add_location(p1, file$b, 17, 12, 721);
    			attr_dev(div1, "class", "text svelte-1mqkxzz");
    			add_location(div1, file$b, 13, 8, 452);
    			attr_dev(div2, "class", "grid svelte-1mqkxzz");
    			add_location(div2, file$b, 20, 12, 822);
    			attr_dev(div3, "class", "photos svelte-1mqkxzz");
    			add_location(div3, file$b, 19, 8, 789);
    			attr_dev(div4, "class", "content svelte-1mqkxzz");
    			add_location(div4, file$b, 12, 4, 422);
    			attr_dev(main, "class", "svelte-1mqkxzz");
    			add_location(main, file$b, 11, 3, 411);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, div4);
    			append_hydration_dev(div4, div1);
    			append_hydration_dev(div1, h1);
    			append_hydration_dev(h1, t0);
    			append_hydration_dev(div1, t1);
    			append_hydration_dev(div1, p0);
    			append_hydration_dev(p0, t2);
    			append_hydration_dev(p0, br0);
    			append_hydration_dev(p0, t3);
    			append_hydration_dev(p0, br1);
    			append_hydration_dev(p0, t4);
    			append_hydration_dev(p0, br2);
    			append_hydration_dev(p0, t5);
    			append_hydration_dev(p0, br3);
    			append_hydration_dev(p0, t6);
    			append_hydration_dev(p0, br4);
    			append_hydration_dev(p0, t7);
    			append_hydration_dev(div1, t8);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div1, t9);
    			append_hydration_dev(div1, p1);
    			append_hydration_dev(p1, t10);
    			append_hydration_dev(div4, t11);
    			append_hydration_dev(div4, div3);
    			append_hydration_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div2, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*photos*/ 1) {
    				each_value = /*photos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Provide', slots, []);

    	let photos = [
    		{
    			src: "/img/imgProvide1.svg",
    			alt: 'фото 1'
    		},
    		{
    			src: "/img/imgProvide2.svg",
    			alt: 'фото 2'
    		},
    		{
    			src: "/img/imgProvide3.svg",
    			alt: 'фото 3'
    		},
    		{
    			src: "/img/imgProvide4.svg",
    			alt: 'фото 4'
    		},
    		{
    			src: "/img/imgProvide5.svg",
    			alt: 'фото 5'
    		},
    		{
    			src: "/img/imgProvide6.svg",
    			alt: 'фото 6'
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Provide> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ photos });

    	$$self.$inject_state = $$props => {
    		if ('photos' in $$props) $$invalidate(0, photos = $$props.photos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [photos];
    }

    class Provide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Provide",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/OurProjects.svelte generated by Svelte v3.59.2 */

    const file$a = "src/components/OurProjects.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (19:16) {#each photos as photo}
    function create_each_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true, class: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (!src_url_equal(img.src, img_src_value = /*photo*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*photo*/ ctx[1].alt);
    			attr_dev(img, "class", "svelte-1tl51ox");
    			add_location(img, file$a, 19, 20, 680);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:16) {#each photos as photo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let div0;
    	let each_value = /*photos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Наши работы");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			h1 = claim_element(main_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Наши работы");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			div2 = claim_element(main_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1tl51ox");
    			add_location(h1, file$a, 14, 4, 513);
    			attr_dev(div0, "class", "grid svelte-1tl51ox");
    			add_location(div0, file$a, 17, 12, 601);
    			attr_dev(div1, "class", "photos svelte-1tl51ox");
    			add_location(div1, file$a, 16, 8, 568);
    			attr_dev(div2, "class", "content svelte-1tl51ox");
    			add_location(div2, file$a, 15, 4, 538);
    			attr_dev(main, "class", "svelte-1tl51ox");
    			add_location(main, file$a, 13, 0, 502);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, h1);
    			append_hydration_dev(h1, t0);
    			append_hydration_dev(main, t1);
    			append_hydration_dev(main, div2);
    			append_hydration_dev(div2, div1);
    			append_hydration_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*photos*/ 1) {
    				each_value = /*photos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OurProjects', slots, []);

    	let photos = [
    		{
    			src: "/img/imgProjects1.svg",
    			alt: "фото 1"
    		},
    		{
    			src: "/img/imgProjects2.svg",
    			alt: "фото 2"
    		},
    		{
    			src: "/img/imgProjects3.svg",
    			alt: "фото 3"
    		},
    		{
    			src: "/img/imgProjects4.svg",
    			alt: "фото 4"
    		},
    		{
    			src: "/img/imgProjects5.svg",
    			alt: "фото 5"
    		},
    		{
    			src: "/img/imgProjects6.svg",
    			alt: "фото 6"
    		},
    		{
    			src: "/img/imgProjects7.svg",
    			alt: "фото 7"
    		},
    		{
    			src: "/img/imgProjects8.svg",
    			alt: "фото 8"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OurProjects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ photos });

    	$$self.$inject_state = $$props => {
    		if ('photos' in $$props) $$invalidate(0, photos = $$props.photos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [photos];
    }

    class OurProjects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OurProjects",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/FooterMain.svelte generated by Svelte v3.59.2 */

    const file$9 = "src/components/FooterMain.svelte";

    function create_fragment$9(ctx) {
    	let footer;
    	let div11;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div7;
    	let h1;
    	let t1;
    	let t2;
    	let ul;
    	let li0;
    	let a0;
    	let h20;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let li1;
    	let a1;
    	let h21;
    	let t6;
    	let t7;
    	let div5;
    	let div2;
    	let p0;
    	let t8;
    	let t9;
    	let a2;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let div3;
    	let p1;
    	let t11;
    	let t12;
    	let a3;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let div4;
    	let p2;
    	let t14;
    	let t15;
    	let a4;
    	let img3;
    	let img3_src_value;
    	let t16;
    	let a5;
    	let img4;
    	let img4_src_value;
    	let t17;
    	let a6;
    	let img5;
    	let img5_src_value;
    	let t18;
    	let a7;
    	let img6;
    	let img6_src_value;
    	let t19;
    	let div6;
    	let p3;
    	let t20;
    	let br0;
    	let t21;
    	let br1;
    	let t22;
    	let br2;
    	let t23;
    	let t24;
    	let div9;
    	let div8;
    	let t25;
    	let div10;
    	let t26;
    	let div13;
    	let div12;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div11 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div7 = element("div");
    			h1 = element("h1");
    			t1 = text("Посмотреть все услуги");
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			h20 = element("h2");
    			t3 = text("Портфолио");
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			h21 = element("h2");
    			t6 = text("Контакты");
    			t7 = space();
    			div5 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			t8 = text("+7 (3462) 66-64-64");
    			t9 = space();
    			a2 = element("a");
    			img1 = element("img");
    			t10 = space();
    			div3 = element("div");
    			p1 = element("p");
    			t11 = text("7992022@mail.ru");
    			t12 = space();
    			a3 = element("a");
    			img2 = element("img");
    			t13 = space();
    			div4 = element("div");
    			p2 = element("p");
    			t14 = text("+79 (227) 99-20-22");
    			t15 = space();
    			a4 = element("a");
    			img3 = element("img");
    			t16 = space();
    			a5 = element("a");
    			img4 = element("img");
    			t17 = space();
    			a6 = element("a");
    			img5 = element("img");
    			t18 = space();
    			a7 = element("a");
    			img6 = element("img");
    			t19 = space();
    			div6 = element("div");
    			p3 = element("p");
    			t20 = text("Политика конфидициальности");
    			br0 = element("br");
    			t21 = text("Условия использования");
    			br1 = element("br");
    			t22 = text("©Реклама плюс\n                    ");
    			br2 = element("br");
    			t23 = text("Все права защищены 2023");
    			t24 = space();
    			div9 = element("div");
    			div8 = element("div");
    			t25 = space();
    			div10 = element("div");
    			t26 = space();
    			div13 = element("div");
    			div12 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			footer = claim_element(nodes, "FOOTER", { class: true });
    			var footer_nodes = children(footer);
    			div11 = claim_element(footer_nodes, "DIV", { class: true });
    			var div11_nodes = children(div11);
    			div0 = claim_element(div11_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			img0 = claim_element(div0_nodes, "IMG", {
    				src: true,
    				class: true,
    				alt: true,
    				width: true,
    				height: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(div11_nodes);
    			div7 = claim_element(div11_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			h1 = claim_element(div7_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Посмотреть все услуги");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div7_nodes);
    			ul = claim_element(div7_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			a0 = claim_element(li0_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			h20 = claim_element(a0_nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			t3 = claim_text(h20_nodes, "Портфолио");
    			h20_nodes.forEach(detach_dev);
    			a0_nodes.forEach(detach_dev);
    			li0_nodes.forEach(detach_dev);
    			t4 = claim_space(ul_nodes);
    			div1 = claim_element(ul_nodes, "DIV", { class: true });
    			children(div1).forEach(detach_dev);
    			t5 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			a1 = claim_element(li1_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			h21 = claim_element(a1_nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			t6 = claim_text(h21_nodes, "Контакты");
    			h21_nodes.forEach(detach_dev);
    			a1_nodes.forEach(detach_dev);
    			li1_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			t7 = claim_space(div7_nodes);
    			div5 = claim_element(div7_nodes, "DIV", {});
    			var div5_nodes = children(div5);
    			div2 = claim_element(div5_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			p0 = claim_element(div2_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t8 = claim_text(p0_nodes, "+7 (3462) 66-64-64");
    			p0_nodes.forEach(detach_dev);
    			t9 = claim_space(div2_nodes);
    			a2 = claim_element(div2_nodes, "A", { href: true, class: true });
    			var a2_nodes = children(a2);
    			img1 = claim_element(a2_nodes, "IMG", { src: true });
    			a2_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t10 = claim_space(div5_nodes);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			p1 = claim_element(div3_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t11 = claim_text(p1_nodes, "7992022@mail.ru");
    			p1_nodes.forEach(detach_dev);
    			t12 = claim_space(div3_nodes);
    			a3 = claim_element(div3_nodes, "A", { href: true, class: true });
    			var a3_nodes = children(a3);
    			img2 = claim_element(a3_nodes, "IMG", { src: true });
    			a3_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t13 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			p2 = claim_element(div4_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t14 = claim_text(p2_nodes, "+79 (227) 99-20-22");
    			p2_nodes.forEach(detach_dev);
    			t15 = claim_space(div4_nodes);
    			a4 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a4_nodes = children(a4);
    			img3 = claim_element(a4_nodes, "IMG", { src: true });
    			a4_nodes.forEach(detach_dev);
    			t16 = claim_space(div4_nodes);
    			a5 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a5_nodes = children(a5);
    			img4 = claim_element(a5_nodes, "IMG", { src: true });
    			a5_nodes.forEach(detach_dev);
    			t17 = claim_space(div4_nodes);
    			a6 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a6_nodes = children(a6);
    			img5 = claim_element(a6_nodes, "IMG", { src: true });
    			a6_nodes.forEach(detach_dev);
    			t18 = claim_space(div4_nodes);
    			a7 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a7_nodes = children(a7);
    			img6 = claim_element(a7_nodes, "IMG", { src: true });
    			a7_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			t19 = claim_space(div7_nodes);
    			div6 = claim_element(div7_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			p3 = claim_element(div6_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t20 = claim_text(p3_nodes, "Политика конфидициальности");
    			br0 = claim_element(p3_nodes, "BR", {});
    			t21 = claim_text(p3_nodes, "Условия использования");
    			br1 = claim_element(p3_nodes, "BR", {});
    			t22 = claim_text(p3_nodes, "©Реклама плюс\n                    ");
    			br2 = claim_element(p3_nodes, "BR", {});
    			t23 = claim_text(p3_nodes, "Все права защищены 2023");
    			p3_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			t24 = claim_space(div11_nodes);
    			div9 = claim_element(div11_nodes, "DIV", { class: true });
    			var div9_nodes = children(div9);
    			div8 = claim_element(div9_nodes, "DIV", { class: true });
    			children(div8).forEach(detach_dev);
    			div9_nodes.forEach(detach_dev);
    			t25 = claim_space(div11_nodes);
    			div10 = claim_element(div11_nodes, "DIV", { class: true });
    			children(div10).forEach(detach_dev);
    			div11_nodes.forEach(detach_dev);
    			t26 = claim_space(footer_nodes);
    			div13 = claim_element(footer_nodes, "DIV", { class: true });
    			var div13_nodes = children(div13);
    			div12 = claim_element(div13_nodes, "DIV", { class: true });
    			children(div12).forEach(detach_dev);
    			div13_nodes.forEach(detach_dev);
    			footer_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (!src_url_equal(img0.src, img0_src_value = "/img/logo_big.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "imgLogo svelte-ta26lb");
    			attr_dev(img0, "alt", "big logo");
    			attr_dev(img0, "width", "568");
    			attr_dev(img0, "height", "180");
    			add_location(img0, file$9, 3, 12, 91);
    			attr_dev(div0, "class", "containerBlcokColor svelte-ta26lb");
    			add_location(div0, file$9, 2, 8, 45);
    			attr_dev(h1, "class", "svelte-ta26lb");
    			add_location(h1, file$9, 12, 12, 331);
    			attr_dev(h20, "class", "svelte-ta26lb");
    			add_location(h20, file$9, 15, 31, 449);
    			attr_dev(a0, "href", "");
    			attr_dev(a0, "class", "svelte-ta26lb");
    			add_location(a0, file$9, 15, 20, 438);
    			add_location(li0, file$9, 14, 16, 413);
    			attr_dev(div1, "class", "block1");
    			add_location(div1, file$9, 17, 16, 510);
    			attr_dev(h21, "class", "svelte-ta26lb");
    			add_location(h21, file$9, 19, 31, 589);
    			attr_dev(a1, "href", "");
    			attr_dev(a1, "class", "svelte-ta26lb");
    			add_location(a1, file$9, 19, 20, 578);
    			add_location(li1, file$9, 18, 16, 553);
    			attr_dev(ul, "class", "footerCol svelte-ta26lb");
    			add_location(ul, file$9, 13, 12, 374);
    			attr_dev(p0, "class", "svelte-ta26lb");
    			add_location(p0, file$9, 24, 20, 732);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/icon/phone_small.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$9, 26, 25, 830);
    			attr_dev(a2, "href", "");
    			attr_dev(a2, "class", "linkPad svelte-ta26lb");
    			add_location(a2, file$9, 25, 20, 778);
    			attr_dev(div2, "class", "contactsInfo svelte-ta26lb");
    			add_location(div2, file$9, 23, 16, 685);
    			attr_dev(p1, "class", "svelte-ta26lb");
    			add_location(p1, file$9, 30, 20, 981);
    			if (!src_url_equal(img2.src, img2_src_value = "/img/icon/mail.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$9, 32, 25, 1076);
    			attr_dev(a3, "href", "");
    			attr_dev(a3, "class", "linkPad svelte-ta26lb");
    			add_location(a3, file$9, 31, 20, 1024);
    			attr_dev(div3, "class", "contactsInfo svelte-ta26lb");
    			add_location(div3, file$9, 29, 16, 934);
    			attr_dev(p2, "class", "svelte-ta26lb");
    			add_location(p2, file$9, 36, 20, 1220);
    			if (!src_url_equal(img3.src, img3_src_value = "/img/icon/tg_small.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$9, 38, 25, 1318);
    			attr_dev(a4, "href", "");
    			attr_dev(a4, "class", "linkPad svelte-ta26lb");
    			add_location(a4, file$9, 37, 20, 1266);
    			if (!src_url_equal(img4.src, img4_src_value = "/img/icon/viber_small.svg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$9, 41, 25, 1452);
    			attr_dev(a5, "href", "");
    			attr_dev(a5, "class", "linkPad svelte-ta26lb");
    			add_location(a5, file$9, 40, 20, 1400);
    			if (!src_url_equal(img5.src, img5_src_value = "/img/icon/watsap_small.svg")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$9, 44, 25, 1589);
    			attr_dev(a6, "href", "");
    			attr_dev(a6, "class", "linkPad svelte-ta26lb");
    			add_location(a6, file$9, 43, 20, 1537);
    			if (!src_url_equal(img6.src, img6_src_value = "/img/icon/phone_small.svg")) attr_dev(img6, "src", img6_src_value);
    			add_location(img6, file$9, 47, 25, 1727);
    			attr_dev(a7, "href", "");
    			attr_dev(a7, "class", "linkPad svelte-ta26lb");
    			add_location(a7, file$9, 46, 20, 1675);
    			attr_dev(div4, "class", "contactsInfo svelte-ta26lb");
    			add_location(div4, file$9, 35, 16, 1173);
    			add_location(div5, file$9, 22, 12, 663);
    			add_location(br0, file$9, 53, 46, 1935);
    			add_location(br1, file$9, 53, 73, 1962);
    			add_location(br2, file$9, 55, 20, 2022);
    			attr_dev(p3, "class", "svelte-ta26lb");
    			add_location(p3, file$9, 52, 16, 1885);
    			attr_dev(div6, "class", "copyText svelte-ta26lb");
    			add_location(div6, file$9, 51, 12, 1846);
    			attr_dev(div7, "class", "container2 svelte-ta26lb");
    			add_location(div7, file$9, 11, 8, 294);
    			attr_dev(div8, "class", "box1 svelte-ta26lb");
    			add_location(div8, file$9, 59, 26, 2133);
    			attr_dev(div9, "class", "box2 svelte-ta26lb");
    			add_location(div9, file$9, 59, 8, 2115);
    			attr_dev(div10, "class", "box3 svelte-ta26lb");
    			add_location(div10, file$9, 60, 8, 2172);
    			attr_dev(div11, "class", "container svelte-ta26lb");
    			add_location(div11, file$9, 1, 4, 13);
    			attr_dev(div12, "class", "box4");
    			add_location(div12, file$9, 63, 8, 2253);
    			attr_dev(div13, "class", "background-element svelte-ta26lb");
    			add_location(div13, file$9, 62, 4, 2212);
    			attr_dev(footer, "class", "svelte-ta26lb");
    			add_location(footer, file$9, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, footer, anchor);
    			append_hydration_dev(footer, div11);
    			append_hydration_dev(div11, div0);
    			append_hydration_dev(div0, img0);
    			append_hydration_dev(div11, t0);
    			append_hydration_dev(div11, div7);
    			append_hydration_dev(div7, h1);
    			append_hydration_dev(h1, t1);
    			append_hydration_dev(div7, t2);
    			append_hydration_dev(div7, ul);
    			append_hydration_dev(ul, li0);
    			append_hydration_dev(li0, a0);
    			append_hydration_dev(a0, h20);
    			append_hydration_dev(h20, t3);
    			append_hydration_dev(ul, t4);
    			append_hydration_dev(ul, div1);
    			append_hydration_dev(ul, t5);
    			append_hydration_dev(ul, li1);
    			append_hydration_dev(li1, a1);
    			append_hydration_dev(a1, h21);
    			append_hydration_dev(h21, t6);
    			append_hydration_dev(div7, t7);
    			append_hydration_dev(div7, div5);
    			append_hydration_dev(div5, div2);
    			append_hydration_dev(div2, p0);
    			append_hydration_dev(p0, t8);
    			append_hydration_dev(div2, t9);
    			append_hydration_dev(div2, a2);
    			append_hydration_dev(a2, img1);
    			append_hydration_dev(div5, t10);
    			append_hydration_dev(div5, div3);
    			append_hydration_dev(div3, p1);
    			append_hydration_dev(p1, t11);
    			append_hydration_dev(div3, t12);
    			append_hydration_dev(div3, a3);
    			append_hydration_dev(a3, img2);
    			append_hydration_dev(div5, t13);
    			append_hydration_dev(div5, div4);
    			append_hydration_dev(div4, p2);
    			append_hydration_dev(p2, t14);
    			append_hydration_dev(div4, t15);
    			append_hydration_dev(div4, a4);
    			append_hydration_dev(a4, img3);
    			append_hydration_dev(div4, t16);
    			append_hydration_dev(div4, a5);
    			append_hydration_dev(a5, img4);
    			append_hydration_dev(div4, t17);
    			append_hydration_dev(div4, a6);
    			append_hydration_dev(a6, img5);
    			append_hydration_dev(div4, t18);
    			append_hydration_dev(div4, a7);
    			append_hydration_dev(a7, img6);
    			append_hydration_dev(div7, t19);
    			append_hydration_dev(div7, div6);
    			append_hydration_dev(div6, p3);
    			append_hydration_dev(p3, t20);
    			append_hydration_dev(p3, br0);
    			append_hydration_dev(p3, t21);
    			append_hydration_dev(p3, br1);
    			append_hydration_dev(p3, t22);
    			append_hydration_dev(p3, br2);
    			append_hydration_dev(p3, t23);
    			append_hydration_dev(div11, t24);
    			append_hydration_dev(div11, div9);
    			append_hydration_dev(div9, div8);
    			append_hydration_dev(div11, t25);
    			append_hydration_dev(div11, div10);
    			append_hydration_dev(footer, t26);
    			append_hydration_dev(footer, div13);
    			append_hydration_dev(div13, div12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FooterMain', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FooterMain> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class FooterMain extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FooterMain",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/OurAdwantage.svelte generated by Svelte v3.59.2 */
    const file$8 = "src/components/OurAdwantage.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let div4;
    	let div0;
    	let h20;
    	let t2;
    	let t3;
    	let p0;
    	let t4;
    	let t5;
    	let div1;
    	let h21;
    	let t6;
    	let t7;
    	let p1;
    	let t8;
    	let t9;
    	let div2;
    	let h22;
    	let t10;
    	let t11;
    	let p2;
    	let t12;
    	let t13;
    	let div3;
    	let h23;
    	let t14;
    	let t15;
    	let p3;
    	let t16;
    	let t17;
    	let div5;
    	let t18;
    	let provide;
    	let t19;
    	let div6;
    	let t20;
    	let ourprojects;
    	let t21;
    	let div7;
    	let t22;
    	let footermain;
    	let t23;
    	let div20;
    	let div8;
    	let t24;
    	let div9;
    	let t25;
    	let div10;
    	let t26;
    	let div12;
    	let div11;
    	let t27;
    	let div14;
    	let div13;
    	let t28;
    	let div17;
    	let div15;
    	let t29;
    	let div16;
    	let t30;
    	let div19;
    	let div18;
    	let current;
    	provide = new Provide({ $$inline: true });
    	ourprojects = new OurProjects({ $$inline: true });
    	footermain = new FooterMain({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Наши преимущества");
    			t1 = space();
    			div4 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			t2 = text("Экспериментируем всегда");
    			t3 = space();
    			p0 = element("p");
    			t4 = text("Возьмём работу любой сложности и выполним наилучшим образом.\n                Каждая наша работа индивидуальна сама по себе, и каждый раз\n                сталкиваемся с новыми непростыми и необычными заказами. Не\n                боимся экспериментировать с новыми материалами. Мы справляемся -\n                заказчики довольны.");
    			t5 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			t6 = text("Монтируем надежно");
    			t7 = space();
    			p1 = element("p");
    			t8 = text("Всегда крепим надежно любые конструкции, учитывая северный\n                климат. Проводим монтажи строго по проекту. Используем самые\n                лучшие материалы.");
    			t9 = space();
    			div2 = element("div");
    			h22 = element("h2");
    			t10 = text("Гарантируем яркость");
    			t11 = space();
    			p2 = element("p");
    			t12 = text("Мы используем самые яркие светодиоды, и не экономим на них.\n                Яркость - наш успех.");
    			t13 = space();
    			div3 = element("div");
    			h23 = element("h2");
    			t14 = text("Печатаем красиво");
    			t15 = space();
    			p3 = element("p");
    			t16 = text("Так отзываются наши заказчики) Свои отзывы можете оставлять на\n                картах дубл гис, яндекс др. Спасибо что выбираете нас! :)");
    			t17 = space();
    			div5 = element("div");
    			t18 = space();
    			create_component(provide.$$.fragment);
    			t19 = space();
    			div6 = element("div");
    			t20 = space();
    			create_component(ourprojects.$$.fragment);
    			t21 = space();
    			div7 = element("div");
    			t22 = space();
    			create_component(footermain.$$.fragment);
    			t23 = space();
    			div20 = element("div");
    			div8 = element("div");
    			t24 = space();
    			div9 = element("div");
    			t25 = space();
    			div10 = element("div");
    			t26 = space();
    			div12 = element("div");
    			div11 = element("div");
    			t27 = space();
    			div14 = element("div");
    			div13 = element("div");
    			t28 = space();
    			div17 = element("div");
    			div15 = element("div");
    			t29 = space();
    			div16 = element("div");
    			t30 = space();
    			div19 = element("div");
    			div18 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			h1 = claim_element(main_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Наши преимущества");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(main_nodes);
    			div4 = claim_element(main_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div0 = claim_element(div4_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h20 = claim_element(div0_nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			t2 = claim_text(h20_nodes, "Экспериментируем всегда");
    			h20_nodes.forEach(detach_dev);
    			t3 = claim_space(div0_nodes);
    			p0 = claim_element(div0_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t4 = claim_text(p0_nodes, "Возьмём работу любой сложности и выполним наилучшим образом.\n                Каждая наша работа индивидуальна сама по себе, и каждый раз\n                сталкиваемся с новыми непростыми и необычными заказами. Не\n                боимся экспериментировать с новыми материалами. Мы справляемся -\n                заказчики довольны.");
    			p0_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t5 = claim_space(div4_nodes);
    			div1 = claim_element(div4_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h21 = claim_element(div1_nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			t6 = claim_text(h21_nodes, "Монтируем надежно");
    			h21_nodes.forEach(detach_dev);
    			t7 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t8 = claim_text(p1_nodes, "Всегда крепим надежно любые конструкции, учитывая северный\n                климат. Проводим монтажи строго по проекту. Используем самые\n                лучшие материалы.");
    			p1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t9 = claim_space(div4_nodes);
    			div2 = claim_element(div4_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			h22 = claim_element(div2_nodes, "H2", { class: true });
    			var h22_nodes = children(h22);
    			t10 = claim_text(h22_nodes, "Гарантируем яркость");
    			h22_nodes.forEach(detach_dev);
    			t11 = claim_space(div2_nodes);
    			p2 = claim_element(div2_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t12 = claim_text(p2_nodes, "Мы используем самые яркие светодиоды, и не экономим на них.\n                Яркость - наш успех.");
    			p2_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t13 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			h23 = claim_element(div3_nodes, "H2", { class: true });
    			var h23_nodes = children(h23);
    			t14 = claim_text(h23_nodes, "Печатаем красиво");
    			h23_nodes.forEach(detach_dev);
    			t15 = claim_space(div3_nodes);
    			p3 = claim_element(div3_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t16 = claim_text(p3_nodes, "Так отзываются наши заказчики) Свои отзывы можете оставлять на\n                картах дубл гис, яндекс др. Спасибо что выбираете нас! :)");
    			p3_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t17 = claim_space(main_nodes);
    			div5 = claim_element(main_nodes, "DIV", { class: true });
    			children(div5).forEach(detach_dev);
    			t18 = claim_space(main_nodes);
    			claim_component(provide.$$.fragment, main_nodes);
    			t19 = claim_space(main_nodes);
    			div6 = claim_element(main_nodes, "DIV", { class: true });
    			children(div6).forEach(detach_dev);
    			t20 = claim_space(main_nodes);
    			claim_component(ourprojects.$$.fragment, main_nodes);
    			t21 = claim_space(main_nodes);
    			div7 = claim_element(main_nodes, "DIV", { class: true });
    			children(div7).forEach(detach_dev);
    			t22 = claim_space(main_nodes);
    			claim_component(footermain.$$.fragment, main_nodes);
    			t23 = claim_space(main_nodes);
    			div20 = claim_element(main_nodes, "DIV", { class: true });
    			var div20_nodes = children(div20);
    			div8 = claim_element(div20_nodes, "DIV", { class: true });
    			children(div8).forEach(detach_dev);
    			t24 = claim_space(div20_nodes);
    			div9 = claim_element(div20_nodes, "DIV", { class: true });
    			children(div9).forEach(detach_dev);
    			t25 = claim_space(div20_nodes);
    			div10 = claim_element(div20_nodes, "DIV", { class: true });
    			children(div10).forEach(detach_dev);
    			t26 = claim_space(div20_nodes);
    			div12 = claim_element(div20_nodes, "DIV", { class: true });
    			var div12_nodes = children(div12);
    			div11 = claim_element(div12_nodes, "DIV", { class: true });
    			children(div11).forEach(detach_dev);
    			div12_nodes.forEach(detach_dev);
    			t27 = claim_space(div20_nodes);
    			div14 = claim_element(div20_nodes, "DIV", { class: true });
    			var div14_nodes = children(div14);
    			div13 = claim_element(div14_nodes, "DIV", { class: true });
    			children(div13).forEach(detach_dev);
    			div14_nodes.forEach(detach_dev);
    			t28 = claim_space(div20_nodes);
    			div17 = claim_element(div20_nodes, "DIV", { class: true });
    			var div17_nodes = children(div17);
    			div15 = claim_element(div17_nodes, "DIV", { class: true });
    			children(div15).forEach(detach_dev);
    			t29 = claim_space(div17_nodes);
    			div16 = claim_element(div17_nodes, "DIV", { class: true });
    			children(div16).forEach(detach_dev);
    			div17_nodes.forEach(detach_dev);
    			t30 = claim_space(div20_nodes);
    			div19 = claim_element(div20_nodes, "DIV", { class: true });
    			var div19_nodes = children(div19);
    			div18 = claim_element(div19_nodes, "DIV", { class: true });
    			children(div18).forEach(detach_dev);
    			div19_nodes.forEach(detach_dev);
    			div20_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-w7co4c");
    			add_location(h1, file$8, 7, 4, 177);
    			attr_dev(h20, "class", "svelte-w7co4c");
    			add_location(h20, file$8, 10, 12, 267);
    			attr_dev(p0, "class", "svelte-w7co4c");
    			add_location(p0, file$8, 11, 12, 312);
    			attr_dev(div0, "class", "block svelte-w7co4c");
    			add_location(div0, file$8, 9, 8, 235);
    			attr_dev(h21, "class", "svelte-w7co4c");
    			add_location(h21, file$8, 20, 12, 733);
    			attr_dev(p1, "class", "svelte-w7co4c");
    			add_location(p1, file$8, 21, 12, 772);
    			attr_dev(div1, "class", "block svelte-w7co4c");
    			add_location(div1, file$8, 19, 8, 701);
    			attr_dev(h22, "class", "svelte-w7co4c");
    			add_location(h22, file$8, 28, 12, 1034);
    			attr_dev(p2, "class", "svelte-w7co4c");
    			add_location(p2, file$8, 29, 12, 1075);
    			attr_dev(div2, "class", "block svelte-w7co4c");
    			add_location(div2, file$8, 27, 8, 1002);
    			attr_dev(h23, "class", "svelte-w7co4c");
    			add_location(h23, file$8, 35, 12, 1264);
    			attr_dev(p3, "class", "svelte-w7co4c");
    			add_location(p3, file$8, 36, 12, 1302);
    			attr_dev(div3, "class", "block svelte-w7co4c");
    			add_location(div3, file$8, 34, 8, 1232);
    			attr_dev(div4, "class", "grid svelte-w7co4c");
    			add_location(div4, file$8, 8, 4, 208);
    			attr_dev(div5, "class", "marginBlock svelte-w7co4c");
    			add_location(div5, file$8, 42, 4, 1506);
    			attr_dev(div6, "class", "marginBlock svelte-w7co4c");
    			add_location(div6, file$8, 44, 4, 1558);
    			attr_dev(div7, "class", "marginBlock2 svelte-w7co4c");
    			add_location(div7, file$8, 46, 4, 1614);
    			attr_dev(div8, "class", "box1 svelte-w7co4c");
    			add_location(div8, file$8, 49, 8, 1711);
    			attr_dev(div9, "class", "box2 svelte-w7co4c");
    			add_location(div9, file$8, 50, 8, 1744);
    			attr_dev(div10, "class", "box3 svelte-w7co4c");
    			add_location(div10, file$8, 51, 8, 1777);
    			attr_dev(div11, "class", "box4 svelte-w7co4c");
    			add_location(div11, file$8, 52, 26, 1828);
    			attr_dev(div12, "class", "box5 svelte-w7co4c");
    			add_location(div12, file$8, 52, 8, 1810);
    			attr_dev(div13, "class", "box7 svelte-w7co4c");
    			add_location(div13, file$8, 53, 26, 1885);
    			attr_dev(div14, "class", "box6 svelte-w7co4c");
    			add_location(div14, file$8, 53, 8, 1867);
    			attr_dev(div15, "class", "box9 svelte-w7co4c");
    			add_location(div15, file$8, 55, 12, 1956);
    			attr_dev(div16, "class", "box8 svelte-w7co4c");
    			add_location(div16, file$8, 56, 12, 1993);
    			attr_dev(div17, "class", "box10 svelte-w7co4c");
    			add_location(div17, file$8, 54, 8, 1924);
    			attr_dev(div18, "class", "box11 svelte-w7co4c");
    			add_location(div18, file$8, 58, 27, 2060);
    			attr_dev(div19, "class", "box12 svelte-w7co4c");
    			add_location(div19, file$8, 58, 8, 2041);
    			attr_dev(div20, "class", "background-element svelte-w7co4c");
    			add_location(div20, file$8, 48, 4, 1670);
    			attr_dev(main, "class", "svelte-w7co4c");
    			add_location(main, file$8, 6, 0, 166);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, h1);
    			append_hydration_dev(h1, t0);
    			append_hydration_dev(main, t1);
    			append_hydration_dev(main, div4);
    			append_hydration_dev(div4, div0);
    			append_hydration_dev(div0, h20);
    			append_hydration_dev(h20, t2);
    			append_hydration_dev(div0, t3);
    			append_hydration_dev(div0, p0);
    			append_hydration_dev(p0, t4);
    			append_hydration_dev(div4, t5);
    			append_hydration_dev(div4, div1);
    			append_hydration_dev(div1, h21);
    			append_hydration_dev(h21, t6);
    			append_hydration_dev(div1, t7);
    			append_hydration_dev(div1, p1);
    			append_hydration_dev(p1, t8);
    			append_hydration_dev(div4, t9);
    			append_hydration_dev(div4, div2);
    			append_hydration_dev(div2, h22);
    			append_hydration_dev(h22, t10);
    			append_hydration_dev(div2, t11);
    			append_hydration_dev(div2, p2);
    			append_hydration_dev(p2, t12);
    			append_hydration_dev(div4, t13);
    			append_hydration_dev(div4, div3);
    			append_hydration_dev(div3, h23);
    			append_hydration_dev(h23, t14);
    			append_hydration_dev(div3, t15);
    			append_hydration_dev(div3, p3);
    			append_hydration_dev(p3, t16);
    			append_hydration_dev(main, t17);
    			append_hydration_dev(main, div5);
    			append_hydration_dev(main, t18);
    			mount_component(provide, main, null);
    			append_hydration_dev(main, t19);
    			append_hydration_dev(main, div6);
    			append_hydration_dev(main, t20);
    			mount_component(ourprojects, main, null);
    			append_hydration_dev(main, t21);
    			append_hydration_dev(main, div7);
    			append_hydration_dev(main, t22);
    			mount_component(footermain, main, null);
    			append_hydration_dev(main, t23);
    			append_hydration_dev(main, div20);
    			append_hydration_dev(div20, div8);
    			append_hydration_dev(div20, t24);
    			append_hydration_dev(div20, div9);
    			append_hydration_dev(div20, t25);
    			append_hydration_dev(div20, div10);
    			append_hydration_dev(div20, t26);
    			append_hydration_dev(div20, div12);
    			append_hydration_dev(div12, div11);
    			append_hydration_dev(div20, t27);
    			append_hydration_dev(div20, div14);
    			append_hydration_dev(div14, div13);
    			append_hydration_dev(div20, t28);
    			append_hydration_dev(div20, div17);
    			append_hydration_dev(div17, div15);
    			append_hydration_dev(div17, t29);
    			append_hydration_dev(div17, div16);
    			append_hydration_dev(div20, t30);
    			append_hydration_dev(div20, div19);
    			append_hydration_dev(div19, div18);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(provide.$$.fragment, local);
    			transition_in(ourprojects.$$.fragment, local);
    			transition_in(footermain.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(provide.$$.fragment, local);
    			transition_out(ourprojects.$$.fragment, local);
    			transition_out(footermain.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(provide);
    			destroy_component(ourprojects);
    			destroy_component(footermain);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OurAdwantage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OurAdwantage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Provide, OurProjects, FooterMain });
    	return [];
    }

    class OurAdwantage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OurAdwantage",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.59.2 */
    const file$7 = "src/pages/Home.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let header;
    	let t0;
    	let mainlogo;
    	let t1;
    	let brendtext;
    	let t2;
    	let workhmao;
    	let t3;
    	let ouradwantage;
    	let current;
    	header = new Header({ $$inline: true });
    	mainlogo = new MainLogo({ $$inline: true });
    	brendtext = new BrendText({ $$inline: true });
    	workhmao = new WorkHMAO({ $$inline: true });
    	ouradwantage = new OurAdwantage({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(mainlogo.$$.fragment);
    			t1 = space();
    			create_component(brendtext.$$.fragment);
    			t2 = space();
    			create_component(workhmao.$$.fragment);
    			t3 = space();
    			create_component(ouradwantage.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			claim_component(header.$$.fragment, main_nodes);
    			t0 = claim_space(main_nodes);
    			claim_component(mainlogo.$$.fragment, main_nodes);
    			t1 = claim_space(main_nodes);
    			claim_component(brendtext.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			claim_component(workhmao.$$.fragment, main_nodes);
    			t3 = claim_space(main_nodes);
    			claim_component(ouradwantage.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(main, file$7, 8, 0, 301);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_hydration_dev(main, t0);
    			mount_component(mainlogo, main, null);
    			append_hydration_dev(main, t1);
    			mount_component(brendtext, main, null);
    			append_hydration_dev(main, t2);
    			mount_component(workhmao, main, null);
    			append_hydration_dev(main, t3);
    			mount_component(ouradwantage, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(mainlogo.$$.fragment, local);
    			transition_in(brendtext.$$.fragment, local);
    			transition_in(workhmao.$$.fragment, local);
    			transition_in(ouradwantage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(mainlogo.$$.fragment, local);
    			transition_out(brendtext.$$.fragment, local);
    			transition_out(workhmao.$$.fragment, local);
    			transition_out(ouradwantage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(mainlogo);
    			destroy_component(brendtext);
    			destroy_component(workhmao);
    			destroy_component(ouradwantage);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		MainLogo,
    		BrendText,
    		WorkHMAO,
    		OurAdwantage
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/HeaderSecond.svelte generated by Svelte v3.59.2 */
    const file$6 = "src/components/HeaderSecond.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (67:4) {#if isMenuOpen}
    function create_if_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			children(div).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "overlay svelte-jz3w3m");
    			add_location(div, file$6, 67, 8, 1517);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*closeMenu*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(67:4) {#if isMenuOpen}",
    		ctx
    	});

    	return block;
    }

    // (95:16) {#if item.open}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let ul;
    	let t;
    	let each_value_1 = /*item*/ ctx[11].content;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			ul = claim_element(div0_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(ul, "class", "svelte-jz3w3m");
    			add_location(ul, file$6, 97, 28, 2627);
    			attr_dev(div0, "class", "accordion-content svelte-jz3w3m");
    			add_location(div0, file$6, 96, 24, 2567);
    			attr_dev(div1, "class", "accordion-content-container svelte-jz3w3m");
    			add_location(div1, file$6, 95, 20, 2501);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div1, anchor);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_hydration_dev(div1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*openModal, items*/ 136) {
    				each_value_1 = /*item*/ ctx[11].content;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(95:16) {#if item.open}",
    		ctx
    	});

    	return block;
    }

    // (99:32) {#each item.content as subitem}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*subitem*/ ctx[14] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[10](/*subitem*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			t = claim_text(li_nodes, t_value);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(li, "class", "svelte-jz3w3m");
    			add_location(li, file$6, 99, 36, 2732);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, li, anchor);
    			append_hydration_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 8 && t_value !== (t_value = /*subitem*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(99:32) {#each item.content as subitem}",
    		ctx
    	});

    	return block;
    }

    // (81:12) {#each items as item, index}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let t0;
    	let t1_value = /*item*/ ctx[11].title + "";
    	let t1;
    	let div1_class_value;
    	let t2;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*index*/ ctx[13]);
    	}

    	let if_block = /*item*/ ctx[11].open && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { class: true, src: true, alt: true });
    			t0 = claim_space(div0_nodes);
    			t1 = claim_text(div0_nodes, t1_value);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "class", img_class_value = "arrow " + (/*item*/ ctx[11].open ? 'open' : '') + " svelte-jz3w3m");
    			if (!src_url_equal(img.src, img_src_value = "/img/icon/arrow.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Arrow");
    			add_location(img, file$6, 86, 24, 2168);
    			attr_dev(div0, "class", "accordion-header svelte-jz3w3m");
    			add_location(div0, file$6, 85, 20, 2113);
    			attr_dev(div1, "class", div1_class_value = "accordion-header-container " + (/*item*/ ctx[11].open ? 'active' : '') + " svelte-jz3w3m");
    			add_location(div1, file$6, 81, 16, 1936);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, div1, anchor);
    			append_hydration_dev(div1, div0);
    			append_hydration_dev(div0, img);
    			append_hydration_dev(div0, t0);
    			append_hydration_dev(div0, t1);
    			insert_hydration_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_hydration_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*items*/ 8 && img_class_value !== (img_class_value = "arrow " + (/*item*/ ctx[11].open ? 'open' : '') + " svelte-jz3w3m")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*items*/ 8 && t1_value !== (t1_value = /*item*/ ctx[11].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*items*/ 8 && div1_class_value !== (div1_class_value = "accordion-header-container " + (/*item*/ ctx[11].open ? 'active' : '') + " svelte-jz3w3m")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (/*item*/ ctx[11].open) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(81:12) {#each items as item, index}",
    		ctx
    	});

    	return block;
    }

    // (113:12) <Link style="text-decoration: none;" to="/"                 >
    function create_default_slot_2(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text("Главная");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t = claim_text(h2_nodes, "Главная");
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "btnNav svelte-jz3w3m");
    			add_location(h2, file$6, 113, 17, 3179);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, h2, anchor);
    			append_hydration_dev(h2, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(113:12) <Link style=\\\"text-decoration: none;\\\" to=\\\"/\\\"                 >",
    		ctx
    	});

    	return block;
    }

    // (119:12) <Link style="text-decoration: none;" to="Contact"                 >
    function create_default_slot_1$1(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text("Контакты");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t = claim_text(h2_nodes, "Контакты");
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "btnNav svelte-jz3w3m");
    			add_location(h2, file$6, 119, 17, 3372);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, h2, anchor);
    			append_hydration_dev(h2, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(119:12) <Link style=\\\"text-decoration: none;\\\" to=\\\"Contact\\\"                 >",
    		ctx
    	});

    	return block;
    }

    // (125:12) <Link style="text-decoration: none;" to="Portfolio"                 >
    function create_default_slot$1(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text("Портфолио");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t = claim_text(h2_nodes, "Портфолио");
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "btnNav svelte-jz3w3m");
    			add_location(h2, file$6, 125, 17, 3568);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, h2, anchor);
    			append_hydration_dev(h2, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(125:12) <Link style=\\\"text-decoration: none;\\\" to=\\\"Portfolio\\\"                 >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let header;
    	let button0;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let t3;
    	let nav;
    	let button1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div4;
    	let t5;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let ul;
    	let li0;
    	let link0;
    	let t7;
    	let div5;
    	let t8;
    	let li1;
    	let link1;
    	let t9;
    	let div6;
    	let t10;
    	let li2;
    	let link2;
    	let t11;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isMenuOpen*/ ctx[0] && create_if_block_1(ctx);
    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	link0 = new Link({
    			props: {
    				style: "text-decoration: none;",
    				to: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				style: "text-decoration: none;",
    				to: "Contact",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				style: "text-decoration: none;",
    				to: "Portfolio",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal = new Modal({
    			props: {
    				isOpen: /*isModalOpen*/ ctx[1],
    				content: /*modalContent*/ ctx[2]
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*closeModal*/ ctx[8]);

    	const block = {
    		c: function create() {
    			header = element("header");
    			button0 = element("button");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			nav = element("nav");
    			button1 = element("button");
    			img0 = element("img");
    			t4 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			img1 = element("img");
    			t6 = space();
    			ul = element("ul");
    			li0 = element("li");
    			create_component(link0.$$.fragment);
    			t7 = space();
    			div5 = element("div");
    			t8 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t9 = space();
    			div6 = element("div");
    			t10 = space();
    			li2 = element("li");
    			create_component(link2.$$.fragment);
    			t11 = space();
    			create_component(modal.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			button0 = claim_element(header_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			div3 = claim_element(button0_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div0 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t0 = claim_space(div3_nodes);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div1).forEach(detach_dev);
    			t1 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div2).forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			t2 = claim_space(header_nodes);
    			if (if_block) if_block.l(header_nodes);
    			t3 = claim_space(header_nodes);
    			nav = claim_element(header_nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);
    			button1 = claim_element(nav_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);

    			img0 = claim_element(button1_nodes, "IMG", {
    				src: true,
    				width: true,
    				height: true,
    				alt: true
    			});

    			button1_nodes.forEach(detach_dev);
    			t4 = claim_space(nav_nodes);
    			div4 = claim_element(nav_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div4_nodes);
    			}

    			div4_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			t5 = claim_space(header_nodes);

    			img1 = claim_element(header_nodes, "IMG", {
    				src: true,
    				alt: true,
    				width: true,
    				height: true
    			});

    			t6 = claim_space(header_nodes);
    			ul = claim_element(header_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			claim_component(link0.$$.fragment, li0_nodes);
    			li0_nodes.forEach(detach_dev);
    			t7 = claim_space(ul_nodes);
    			div5 = claim_element(ul_nodes, "DIV", { class: true });
    			children(div5).forEach(detach_dev);
    			t8 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			claim_component(link1.$$.fragment, li1_nodes);
    			li1_nodes.forEach(detach_dev);
    			t9 = claim_space(ul_nodes);
    			div6 = claim_element(ul_nodes, "DIV", { class: true });
    			children(div6).forEach(detach_dev);
    			t10 = claim_space(ul_nodes);
    			li2 = claim_element(ul_nodes, "LI", {});
    			var li2_nodes = children(li2);
    			claim_component(link2.$$.fragment, li2_nodes);
    			li2_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			t11 = claim_space(nodes);
    			claim_component(modal.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "svelte-jz3w3m");
    			add_location(div0, file$6, 60, 12, 1398);
    			attr_dev(div1, "class", "svelte-jz3w3m");
    			add_location(div1, file$6, 61, 12, 1422);
    			attr_dev(div2, "class", "svelte-jz3w3m");
    			add_location(div2, file$6, 62, 12, 1446);
    			attr_dev(div3, "class", "burger-menu svelte-jz3w3m");
    			toggle_class(div3, "open", /*isMenuOpen*/ ctx[0]);
    			add_location(div3, file$6, 59, 8, 1336);
    			attr_dev(button0, "class", "burger-button svelte-jz3w3m");
    			add_location(button0, file$6, 58, 4, 1275);
    			if (!src_url_equal(img0.src, img0_src_value = "/img/arrowMenu.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "25");
    			attr_dev(img0, "height", "25");
    			attr_dev(img0, "alt", "Закрыть");
    			add_location(img0, file$6, 72, 12, 1683);
    			attr_dev(button1, "class", "close-button svelte-jz3w3m");
    			add_location(button1, file$6, 71, 8, 1619);
    			attr_dev(div4, "class", "accordion svelte-jz3w3m");
    			add_location(div4, file$6, 79, 8, 1855);
    			attr_dev(nav, "class", "svelte-jz3w3m");
    			toggle_class(nav, "open", /*isMenuOpen*/ ctx[0]);
    			add_location(nav, file$6, 70, 4, 1581);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/logo_small.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "small logo");
    			attr_dev(img1, "width", "200");
    			attr_dev(img1, "height", "64");
    			add_location(img1, file$6, 109, 4, 2992);
    			add_location(li0, file$6, 111, 8, 3101);
    			attr_dev(div5, "class", "block1 svelte-jz3w3m");
    			add_location(div5, file$6, 116, 8, 3253);
    			add_location(li1, file$6, 117, 8, 3288);
    			attr_dev(div6, "class", "block1 svelte-jz3w3m");
    			add_location(div6, file$6, 122, 8, 3447);
    			add_location(li2, file$6, 123, 8, 3482);
    			attr_dev(ul, "class", "ulHeader svelte-jz3w3m");
    			add_location(ul, file$6, 110, 4, 3071);
    			attr_dev(header, "class", "svelte-jz3w3m");
    			add_location(header, file$6, 57, 0, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, header, anchor);
    			append_hydration_dev(header, button0);
    			append_hydration_dev(button0, div3);
    			append_hydration_dev(div3, div0);
    			append_hydration_dev(div3, t0);
    			append_hydration_dev(div3, div1);
    			append_hydration_dev(div3, t1);
    			append_hydration_dev(div3, div2);
    			append_hydration_dev(header, t2);
    			if (if_block) if_block.m(header, null);
    			append_hydration_dev(header, t3);
    			append_hydration_dev(header, nav);
    			append_hydration_dev(nav, button1);
    			append_hydration_dev(button1, img0);
    			append_hydration_dev(nav, t4);
    			append_hydration_dev(nav, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div4, null);
    				}
    			}

    			append_hydration_dev(header, t5);
    			append_hydration_dev(header, img1);
    			append_hydration_dev(header, t6);
    			append_hydration_dev(header, ul);
    			append_hydration_dev(ul, li0);
    			mount_component(link0, li0, null);
    			append_hydration_dev(ul, t7);
    			append_hydration_dev(ul, div5);
    			append_hydration_dev(ul, t8);
    			append_hydration_dev(ul, li1);
    			mount_component(link1, li1, null);
    			append_hydration_dev(ul, t9);
    			append_hydration_dev(ul, div6);
    			append_hydration_dev(ul, t10);
    			append_hydration_dev(ul, li2);
    			mount_component(link2, li2, null);
    			insert_hydration_dev(target, t11, anchor);
    			mount_component(modal, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleMenu*/ ctx[4], false, false, false, false),
    					listen_dev(button1, "click", /*toggleMenu*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*isMenuOpen*/ 1) {
    				toggle_class(div3, "open", /*isMenuOpen*/ ctx[0]);
    			}

    			if (/*isMenuOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(header, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*items, openModal, toggle*/ 200) {
    				each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*isMenuOpen*/ 1) {
    				toggle_class(nav, "open", /*isMenuOpen*/ ctx[0]);
    			}

    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const modal_changes = {};
    			if (dirty & /*isModalOpen*/ 2) modal_changes.isOpen = /*isModalOpen*/ ctx[1];
    			if (dirty & /*modalContent*/ 4) modal_changes.content = /*modalContent*/ ctx[2];
    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			if (detaching) detach_dev(t11);
    			destroy_component(modal, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeaderSecond', slots, []);
    	let isMenuOpen = false;
    	let isModalOpen = false;
    	let modalContent = "";

    	function toggleMenu() {
    		$$invalidate(0, isMenuOpen = !isMenuOpen);
    	}

    	function closeMenu() {
    		$$invalidate(0, isMenuOpen = false);
    	}

    	let items = [
    		{
    			title: "Услуги печати",
    			content: [
    				"Печать на баннере",
    				"Печать на сетке",
    				"Печать на самоклейке",
    				"Интерьерная печать"
    			],
    			open: false
    		},
    		{
    			title: "Вывески и таблички",
    			content: ["Item 2.1", "Item 2.2", "Item 2.3"],
    			open: false
    		},
    		{
    			title: "Прочие услуги",
    			content: ["Item 3.1", "Item 3.2", "Item 3.3"],
    			open: false
    		}
    	];

    	function toggle(index) {
    		$$invalidate(3, items = items.map((item, i) => ({
    			...item,
    			open: i === index ? !item.open : item.open
    		})));
    	}

    	function openModal(content) {
    		$$invalidate(2, modalContent = content);
    		$$invalidate(1, isModalOpen = true);
    	}

    	function closeModal() {
    		$$invalidate(1, isModalOpen = false);
    		$$invalidate(2, modalContent = "");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeaderSecond> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => toggle(index);
    	const click_handler_1 = subitem => openModal(subitem);

    	$$self.$capture_state = () => ({
    		Link,
    		Modal,
    		isMenuOpen,
    		isModalOpen,
    		modalContent,
    		toggleMenu,
    		closeMenu,
    		items,
    		toggle,
    		openModal,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('isMenuOpen' in $$props) $$invalidate(0, isMenuOpen = $$props.isMenuOpen);
    		if ('isModalOpen' in $$props) $$invalidate(1, isModalOpen = $$props.isModalOpen);
    		if ('modalContent' in $$props) $$invalidate(2, modalContent = $$props.modalContent);
    		if ('items' in $$props) $$invalidate(3, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isMenuOpen,
    		isModalOpen,
    		modalContent,
    		items,
    		toggleMenu,
    		closeMenu,
    		toggle,
    		openModal,
    		closeModal,
    		click_handler,
    		click_handler_1
    	];
    }

    class HeaderSecond extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeaderSecond",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/ContactsText.svelte generated by Svelte v3.59.2 */

    const file$5 = "src/components/ContactsText.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div1;
    	let h1;
    	let t2;
    	let t3;
    	let div3;
    	let t4;
    	let p0;
    	let t5;
    	let t6;
    	let div4;
    	let t7;
    	let div8;
    	let div5;
    	let p1;
    	let t8;
    	let t9;
    	let a0;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let div6;
    	let p2;
    	let t11;
    	let t12;
    	let a1;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let div7;
    	let p3;
    	let t14;
    	let t15;
    	let a2;
    	let img3;
    	let img3_src_value;
    	let t16;
    	let a3;
    	let img4;
    	let img4_src_value;
    	let t17;
    	let a4;
    	let img5;
    	let img5_src_value;
    	let t18;
    	let div9;
    	let t19;
    	let div10;
    	let script;
    	let script_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t2 = text("Контакты");
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			p0 = element("p");
    			t5 = text("Оставляйте свои отзывы на картах дубл гис, яндекс и др");
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			div8 = element("div");
    			div5 = element("div");
    			p1 = element("p");
    			t8 = text("+7 (3462) 66-64-64");
    			t9 = space();
    			a0 = element("a");
    			img1 = element("img");
    			t10 = space();
    			div6 = element("div");
    			p2 = element("p");
    			t11 = text("7992022@mail.ru");
    			t12 = space();
    			a1 = element("a");
    			img2 = element("img");
    			t13 = space();
    			div7 = element("div");
    			p3 = element("p");
    			t14 = text("+79 (227) 99-20-22");
    			t15 = space();
    			a2 = element("a");
    			img3 = element("img");
    			t16 = space();
    			a3 = element("a");
    			img4 = element("img");
    			t17 = space();
    			a4 = element("a");
    			img5 = element("img");
    			t18 = space();
    			div9 = element("div");
    			t19 = space();
    			div10 = element("div");
    			script = element("script");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div0 = claim_element(main_nodes, "DIV", { style: true });
    			children(div0).forEach(detach_dev);
    			t0 = claim_space(main_nodes);
    			div2 = claim_element(main_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			img0 = claim_element(div2_nodes, "IMG", { src: true, alt: true });
    			t1 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h1 = claim_element(div1_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t2 = claim_text(h1_nodes, "Контакты");
    			h1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			div3 = claim_element(main_nodes, "DIV", { style: true });
    			children(div3).forEach(detach_dev);
    			t4 = claim_space(main_nodes);
    			p0 = claim_element(main_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t5 = claim_text(p0_nodes, "Оставляйте свои отзывы на картах дубл гис, яндекс и др");
    			p0_nodes.forEach(detach_dev);
    			t6 = claim_space(main_nodes);
    			div4 = claim_element(main_nodes, "DIV", { style: true });
    			children(div4).forEach(detach_dev);
    			t7 = claim_space(main_nodes);
    			div8 = claim_element(main_nodes, "DIV", { class: true });
    			var div8_nodes = children(div8);
    			div5 = claim_element(div8_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			p1 = claim_element(div5_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t8 = claim_text(p1_nodes, "+7 (3462) 66-64-64");
    			p1_nodes.forEach(detach_dev);
    			t9 = claim_space(div5_nodes);
    			a0 = claim_element(div5_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			img1 = claim_element(a0_nodes, "IMG", { src: true, alt: true, class: true });
    			a0_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			t10 = claim_space(div8_nodes);
    			div6 = claim_element(div8_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			p2 = claim_element(div6_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t11 = claim_text(p2_nodes, "7992022@mail.ru");
    			p2_nodes.forEach(detach_dev);
    			t12 = claim_space(div6_nodes);
    			a1 = claim_element(div6_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			img2 = claim_element(a1_nodes, "IMG", { src: true, alt: true, class: true });
    			a1_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			t13 = claim_space(div8_nodes);
    			div7 = claim_element(div8_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			p3 = claim_element(div7_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t14 = claim_text(p3_nodes, "+79 (227) 99-20-22");
    			p3_nodes.forEach(detach_dev);
    			t15 = claim_space(div7_nodes);
    			a2 = claim_element(div7_nodes, "A", { href: true, class: true });
    			var a2_nodes = children(a2);
    			img3 = claim_element(a2_nodes, "IMG", { src: true, alt: true, class: true });
    			a2_nodes.forEach(detach_dev);
    			t16 = claim_space(div7_nodes);
    			a3 = claim_element(div7_nodes, "A", { href: true, class: true });
    			var a3_nodes = children(a3);
    			img4 = claim_element(a3_nodes, "IMG", { src: true, alt: true, class: true });
    			a3_nodes.forEach(detach_dev);
    			t17 = claim_space(div7_nodes);
    			a4 = claim_element(div7_nodes, "A", { href: true, class: true });
    			var a4_nodes = children(a4);
    			img5 = claim_element(a4_nodes, "IMG", { src: true, alt: true, class: true });
    			a4_nodes.forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			div8_nodes.forEach(detach_dev);
    			t18 = claim_space(main_nodes);
    			div9 = claim_element(main_nodes, "DIV", { style: true });
    			children(div9).forEach(detach_dev);
    			t19 = claim_space(main_nodes);
    			div10 = claim_element(main_nodes, "DIV", { class: true });
    			var div10_nodes = children(div10);
    			script = claim_element(div10_nodes, "SCRIPT", { type: true, charset: true, src: true });
    			var script_nodes = children(script);
    			script_nodes.forEach(detach_dev);
    			div10_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(div0, "margin", "1%");
    			add_location(div0, file$5, 4, 4, 31);
    			if (!src_url_equal(img0.src, img0_src_value = "/img/bloc.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "bloc");
    			add_location(img0, file$5, 6, 8, 96);
    			attr_dev(h1, "class", "textMainCont svelte-l3nzs9");
    			add_location(h1, file$5, 8, 12, 184);
    			attr_dev(div1, "class", "text-container svelte-l3nzs9");
    			add_location(div1, file$5, 7, 8, 143);
    			attr_dev(div2, "class", "divBloc svelte-l3nzs9");
    			add_location(div2, file$5, 5, 4, 66);
    			set_style(div3, "margin", "0.7%");
    			add_location(div3, file$5, 11, 4, 253);
    			attr_dev(p0, "class", "textReview svelte-l3nzs9");
    			add_location(p0, file$5, 12, 4, 290);
    			set_style(div4, "margin", "1%");
    			add_location(div4, file$5, 15, 4, 389);
    			attr_dev(p1, "class", "textInfoCont svelte-l3nzs9");
    			add_location(p1, file$5, 18, 12, 491);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/icon/phone.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "phone");
    			attr_dev(img1, "class", "svelte-l3nzs9");
    			add_location(img1, file$5, 19, 24, 562);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "svelte-l3nzs9");
    			add_location(a0, file$5, 19, 12, 550);
    			attr_dev(div5, "class", "infoBlock svelte-l3nzs9");
    			add_location(div5, file$5, 17, 8, 455);
    			attr_dev(p2, "class", "textInfoCont svelte-l3nzs9");
    			add_location(p2, file$5, 22, 12, 671);
    			if (!src_url_equal(img2.src, img2_src_value = "/img/icon/mail2.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "phone");
    			attr_dev(img2, "class", "svelte-l3nzs9");
    			add_location(img2, file$5, 23, 24, 739);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "svelte-l3nzs9");
    			add_location(a1, file$5, 23, 12, 727);
    			attr_dev(div6, "class", "infoBlock svelte-l3nzs9");
    			add_location(div6, file$5, 21, 8, 635);
    			attr_dev(p3, "class", "textInfoCont svelte-l3nzs9");
    			add_location(p3, file$5, 26, 12, 848);
    			if (!src_url_equal(img3.src, img3_src_value = "/img/icon/tgBrown.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "phone");
    			attr_dev(img3, "class", "svelte-l3nzs9");
    			add_location(img3, file$5, 28, 17, 952);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "imgIcon svelte-l3nzs9");
    			add_location(a2, file$5, 27, 12, 907);
    			if (!src_url_equal(img4.src, img4_src_value = "/img/icon/viderBrown.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "phone");
    			attr_dev(img4, "class", "svelte-l3nzs9");
    			add_location(img4, file$5, 31, 17, 1074);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "imgIcon svelte-l3nzs9");
    			add_location(a3, file$5, 30, 12, 1029);
    			if (!src_url_equal(img5.src, img5_src_value = "/img/icon/watsappBrown.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "phone");
    			attr_dev(img5, "class", "svelte-l3nzs9");
    			add_location(img5, file$5, 34, 17, 1199);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "imgIcon svelte-l3nzs9");
    			add_location(a4, file$5, 33, 12, 1154);
    			attr_dev(div7, "class", "infoBlock svelte-l3nzs9");
    			add_location(div7, file$5, 25, 8, 812);
    			attr_dev(div8, "class", "infoCont svelte-l3nzs9");
    			add_location(div8, file$5, 16, 4, 424);
    			set_style(div9, "margin", "1%");
    			add_location(div9, file$5, 38, 4, 1299);
    			attr_dev(script, "type", "text/javascript");
    			attr_dev(script, "charset", "utf-8");
    			script.async = true;
    			if (!src_url_equal(script.src, script_src_value = "https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Af315e0bca7fe4427a4f180573a635c8dd661d3047eeefffdadc094943b384db9&width=100%&height=632&lang=ru_RU&scroll=true")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$5, 40, 8, 1366);
    			attr_dev(div10, "class", "borderDiv svelte-l3nzs9");
    			add_location(div10, file$5, 39, 4, 1334);
    			attr_dev(main, "class", "svelte-l3nzs9");
    			add_location(main, file$5, 3, 0, 20);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, div0);
    			append_hydration_dev(main, t0);
    			append_hydration_dev(main, div2);
    			append_hydration_dev(div2, img0);
    			append_hydration_dev(div2, t1);
    			append_hydration_dev(div2, div1);
    			append_hydration_dev(div1, h1);
    			append_hydration_dev(h1, t2);
    			append_hydration_dev(main, t3);
    			append_hydration_dev(main, div3);
    			append_hydration_dev(main, t4);
    			append_hydration_dev(main, p0);
    			append_hydration_dev(p0, t5);
    			append_hydration_dev(main, t6);
    			append_hydration_dev(main, div4);
    			append_hydration_dev(main, t7);
    			append_hydration_dev(main, div8);
    			append_hydration_dev(div8, div5);
    			append_hydration_dev(div5, p1);
    			append_hydration_dev(p1, t8);
    			append_hydration_dev(div5, t9);
    			append_hydration_dev(div5, a0);
    			append_hydration_dev(a0, img1);
    			append_hydration_dev(div8, t10);
    			append_hydration_dev(div8, div6);
    			append_hydration_dev(div6, p2);
    			append_hydration_dev(p2, t11);
    			append_hydration_dev(div6, t12);
    			append_hydration_dev(div6, a1);
    			append_hydration_dev(a1, img2);
    			append_hydration_dev(div8, t13);
    			append_hydration_dev(div8, div7);
    			append_hydration_dev(div7, p3);
    			append_hydration_dev(p3, t14);
    			append_hydration_dev(div7, t15);
    			append_hydration_dev(div7, a2);
    			append_hydration_dev(a2, img3);
    			append_hydration_dev(div7, t16);
    			append_hydration_dev(div7, a3);
    			append_hydration_dev(a3, img4);
    			append_hydration_dev(div7, t17);
    			append_hydration_dev(div7, a4);
    			append_hydration_dev(a4, img5);
    			append_hydration_dev(main, t18);
    			append_hydration_dev(main, div9);
    			append_hydration_dev(main, t19);
    			append_hydration_dev(main, div10);
    			append_hydration_dev(div10, script);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContactsText', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContactsText> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ContactsText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactsText",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.59.2 */

    const file$4 = "src/components/Footer.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let div11;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div7;
    	let h1;
    	let t1;
    	let t2;
    	let ul;
    	let li0;
    	let a0;
    	let h20;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let li1;
    	let a1;
    	let h21;
    	let t6;
    	let t7;
    	let div5;
    	let div2;
    	let p0;
    	let t8;
    	let t9;
    	let a2;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let div3;
    	let p1;
    	let t11;
    	let t12;
    	let a3;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let div4;
    	let p2;
    	let t14;
    	let t15;
    	let a4;
    	let img3;
    	let img3_src_value;
    	let t16;
    	let a5;
    	let img4;
    	let img4_src_value;
    	let t17;
    	let a6;
    	let img5;
    	let img5_src_value;
    	let t18;
    	let a7;
    	let img6;
    	let img6_src_value;
    	let t19;
    	let div6;
    	let p3;
    	let t20;
    	let br0;
    	let t21;
    	let br1;
    	let t22;
    	let br2;
    	let t23;
    	let t24;
    	let div9;
    	let div8;
    	let t25;
    	let div10;
    	let t26;
    	let div13;
    	let div12;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div11 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div7 = element("div");
    			h1 = element("h1");
    			t1 = text("Посмотреть все услуги");
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			h20 = element("h2");
    			t3 = text("Портфолио");
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			h21 = element("h2");
    			t6 = text("Контакты");
    			t7 = space();
    			div5 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			t8 = text("+7 (3462) 66-64-64");
    			t9 = space();
    			a2 = element("a");
    			img1 = element("img");
    			t10 = space();
    			div3 = element("div");
    			p1 = element("p");
    			t11 = text("7992022@mail.ru");
    			t12 = space();
    			a3 = element("a");
    			img2 = element("img");
    			t13 = space();
    			div4 = element("div");
    			p2 = element("p");
    			t14 = text("+79 (227) 99-20-22");
    			t15 = space();
    			a4 = element("a");
    			img3 = element("img");
    			t16 = space();
    			a5 = element("a");
    			img4 = element("img");
    			t17 = space();
    			a6 = element("a");
    			img5 = element("img");
    			t18 = space();
    			a7 = element("a");
    			img6 = element("img");
    			t19 = space();
    			div6 = element("div");
    			p3 = element("p");
    			t20 = text("Политика конфидициальности");
    			br0 = element("br");
    			t21 = text("Условия использования");
    			br1 = element("br");
    			t22 = text("©Реклама плюс\n                    ");
    			br2 = element("br");
    			t23 = text("Все права защищены 2023");
    			t24 = space();
    			div9 = element("div");
    			div8 = element("div");
    			t25 = space();
    			div10 = element("div");
    			t26 = space();
    			div13 = element("div");
    			div12 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			footer = claim_element(nodes, "FOOTER", { class: true });
    			var footer_nodes = children(footer);
    			div11 = claim_element(footer_nodes, "DIV", { class: true });
    			var div11_nodes = children(div11);
    			div0 = claim_element(div11_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			img0 = claim_element(div0_nodes, "IMG", {
    				src: true,
    				class: true,
    				alt: true,
    				width: true,
    				height: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(div11_nodes);
    			div7 = claim_element(div11_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			h1 = claim_element(div7_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Посмотреть все услуги");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div7_nodes);
    			ul = claim_element(div7_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			a0 = claim_element(li0_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			h20 = claim_element(a0_nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			t3 = claim_text(h20_nodes, "Портфолио");
    			h20_nodes.forEach(detach_dev);
    			a0_nodes.forEach(detach_dev);
    			li0_nodes.forEach(detach_dev);
    			t4 = claim_space(ul_nodes);
    			div1 = claim_element(ul_nodes, "DIV", { class: true });
    			children(div1).forEach(detach_dev);
    			t5 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			a1 = claim_element(li1_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			h21 = claim_element(a1_nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			t6 = claim_text(h21_nodes, "Контакты");
    			h21_nodes.forEach(detach_dev);
    			a1_nodes.forEach(detach_dev);
    			li1_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			t7 = claim_space(div7_nodes);
    			div5 = claim_element(div7_nodes, "DIV", {});
    			var div5_nodes = children(div5);
    			div2 = claim_element(div5_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			p0 = claim_element(div2_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t8 = claim_text(p0_nodes, "+7 (3462) 66-64-64");
    			p0_nodes.forEach(detach_dev);
    			t9 = claim_space(div2_nodes);
    			a2 = claim_element(div2_nodes, "A", { href: true, class: true });
    			var a2_nodes = children(a2);
    			img1 = claim_element(a2_nodes, "IMG", { src: true });
    			a2_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t10 = claim_space(div5_nodes);
    			div3 = claim_element(div5_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			p1 = claim_element(div3_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t11 = claim_text(p1_nodes, "7992022@mail.ru");
    			p1_nodes.forEach(detach_dev);
    			t12 = claim_space(div3_nodes);
    			a3 = claim_element(div3_nodes, "A", { href: true, class: true });
    			var a3_nodes = children(a3);
    			img2 = claim_element(a3_nodes, "IMG", { src: true });
    			a3_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t13 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			p2 = claim_element(div4_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t14 = claim_text(p2_nodes, "+79 (227) 99-20-22");
    			p2_nodes.forEach(detach_dev);
    			t15 = claim_space(div4_nodes);
    			a4 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a4_nodes = children(a4);
    			img3 = claim_element(a4_nodes, "IMG", { src: true });
    			a4_nodes.forEach(detach_dev);
    			t16 = claim_space(div4_nodes);
    			a5 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a5_nodes = children(a5);
    			img4 = claim_element(a5_nodes, "IMG", { src: true });
    			a5_nodes.forEach(detach_dev);
    			t17 = claim_space(div4_nodes);
    			a6 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a6_nodes = children(a6);
    			img5 = claim_element(a6_nodes, "IMG", { src: true });
    			a6_nodes.forEach(detach_dev);
    			t18 = claim_space(div4_nodes);
    			a7 = claim_element(div4_nodes, "A", { href: true, class: true });
    			var a7_nodes = children(a7);
    			img6 = claim_element(a7_nodes, "IMG", { src: true });
    			a7_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			t19 = claim_space(div7_nodes);
    			div6 = claim_element(div7_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			p3 = claim_element(div6_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t20 = claim_text(p3_nodes, "Политика конфидициальности");
    			br0 = claim_element(p3_nodes, "BR", {});
    			t21 = claim_text(p3_nodes, "Условия использования");
    			br1 = claim_element(p3_nodes, "BR", {});
    			t22 = claim_text(p3_nodes, "©Реклама плюс\n                    ");
    			br2 = claim_element(p3_nodes, "BR", {});
    			t23 = claim_text(p3_nodes, "Все права защищены 2023");
    			p3_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			t24 = claim_space(div11_nodes);
    			div9 = claim_element(div11_nodes, "DIV", { class: true });
    			var div9_nodes = children(div9);
    			div8 = claim_element(div9_nodes, "DIV", { class: true });
    			children(div8).forEach(detach_dev);
    			div9_nodes.forEach(detach_dev);
    			t25 = claim_space(div11_nodes);
    			div10 = claim_element(div11_nodes, "DIV", { class: true });
    			children(div10).forEach(detach_dev);
    			div11_nodes.forEach(detach_dev);
    			t26 = claim_space(footer_nodes);
    			div13 = claim_element(footer_nodes, "DIV", { class: true });
    			var div13_nodes = children(div13);
    			div12 = claim_element(div13_nodes, "DIV", { class: true });
    			children(div12).forEach(detach_dev);
    			div13_nodes.forEach(detach_dev);
    			footer_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (!src_url_equal(img0.src, img0_src_value = "/img/logo_big.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "imgLogo svelte-15pgv5g");
    			attr_dev(img0, "alt", "big logo");
    			attr_dev(img0, "width", "568");
    			attr_dev(img0, "height", "180");
    			add_location(img0, file$4, 3, 12, 91);
    			attr_dev(div0, "class", "containerBlcokColor svelte-15pgv5g");
    			add_location(div0, file$4, 2, 8, 45);
    			attr_dev(h1, "class", "svelte-15pgv5g");
    			add_location(h1, file$4, 12, 12, 331);
    			attr_dev(h20, "class", "svelte-15pgv5g");
    			add_location(h20, file$4, 15, 31, 449);
    			attr_dev(a0, "href", "");
    			attr_dev(a0, "class", "svelte-15pgv5g");
    			add_location(a0, file$4, 15, 20, 438);
    			add_location(li0, file$4, 14, 16, 413);
    			attr_dev(div1, "class", "block1");
    			add_location(div1, file$4, 17, 16, 510);
    			attr_dev(h21, "class", "svelte-15pgv5g");
    			add_location(h21, file$4, 19, 31, 589);
    			attr_dev(a1, "href", "");
    			attr_dev(a1, "class", "svelte-15pgv5g");
    			add_location(a1, file$4, 19, 20, 578);
    			add_location(li1, file$4, 18, 16, 553);
    			attr_dev(ul, "class", "footerCol svelte-15pgv5g");
    			add_location(ul, file$4, 13, 12, 374);
    			attr_dev(p0, "class", "svelte-15pgv5g");
    			add_location(p0, file$4, 24, 20, 732);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/icon/phone_small.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$4, 26, 25, 830);
    			attr_dev(a2, "href", "");
    			attr_dev(a2, "class", "linkPad svelte-15pgv5g");
    			add_location(a2, file$4, 25, 20, 778);
    			attr_dev(div2, "class", "contactsInfo svelte-15pgv5g");
    			add_location(div2, file$4, 23, 16, 685);
    			attr_dev(p1, "class", "svelte-15pgv5g");
    			add_location(p1, file$4, 30, 20, 981);
    			if (!src_url_equal(img2.src, img2_src_value = "/img/icon/mail.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$4, 32, 25, 1076);
    			attr_dev(a3, "href", "");
    			attr_dev(a3, "class", "linkPad svelte-15pgv5g");
    			add_location(a3, file$4, 31, 20, 1024);
    			attr_dev(div3, "class", "contactsInfo svelte-15pgv5g");
    			add_location(div3, file$4, 29, 16, 934);
    			attr_dev(p2, "class", "svelte-15pgv5g");
    			add_location(p2, file$4, 36, 20, 1220);
    			if (!src_url_equal(img3.src, img3_src_value = "/img/icon/tg_small.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$4, 38, 25, 1318);
    			attr_dev(a4, "href", "");
    			attr_dev(a4, "class", "linkPad svelte-15pgv5g");
    			add_location(a4, file$4, 37, 20, 1266);
    			if (!src_url_equal(img4.src, img4_src_value = "/img/icon/viber_small.svg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$4, 41, 25, 1452);
    			attr_dev(a5, "href", "");
    			attr_dev(a5, "class", "linkPad svelte-15pgv5g");
    			add_location(a5, file$4, 40, 20, 1400);
    			if (!src_url_equal(img5.src, img5_src_value = "/img/icon/watsap_small.svg")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$4, 44, 25, 1589);
    			attr_dev(a6, "href", "");
    			attr_dev(a6, "class", "linkPad svelte-15pgv5g");
    			add_location(a6, file$4, 43, 20, 1537);
    			if (!src_url_equal(img6.src, img6_src_value = "/img/icon/phone_small.svg")) attr_dev(img6, "src", img6_src_value);
    			add_location(img6, file$4, 47, 25, 1727);
    			attr_dev(a7, "href", "");
    			attr_dev(a7, "class", "linkPad svelte-15pgv5g");
    			add_location(a7, file$4, 46, 20, 1675);
    			attr_dev(div4, "class", "contactsInfo svelte-15pgv5g");
    			add_location(div4, file$4, 35, 16, 1173);
    			add_location(div5, file$4, 22, 12, 663);
    			add_location(br0, file$4, 53, 46, 1935);
    			add_location(br1, file$4, 53, 73, 1962);
    			add_location(br2, file$4, 55, 20, 2022);
    			attr_dev(p3, "class", "svelte-15pgv5g");
    			add_location(p3, file$4, 52, 16, 1885);
    			attr_dev(div6, "class", "copyText svelte-15pgv5g");
    			add_location(div6, file$4, 51, 12, 1846);
    			attr_dev(div7, "class", "container2 svelte-15pgv5g");
    			add_location(div7, file$4, 11, 8, 294);
    			attr_dev(div8, "class", "box1 svelte-15pgv5g");
    			add_location(div8, file$4, 59, 26, 2133);
    			attr_dev(div9, "class", "box2 svelte-15pgv5g");
    			add_location(div9, file$4, 59, 8, 2115);
    			attr_dev(div10, "class", "box3 svelte-15pgv5g");
    			add_location(div10, file$4, 60, 8, 2172);
    			attr_dev(div11, "class", "container svelte-15pgv5g");
    			add_location(div11, file$4, 1, 4, 13);
    			attr_dev(div12, "class", "box4");
    			add_location(div12, file$4, 63, 8, 2253);
    			attr_dev(div13, "class", "background-element svelte-15pgv5g");
    			add_location(div13, file$4, 62, 4, 2212);
    			attr_dev(footer, "class", "svelte-15pgv5g");
    			add_location(footer, file$4, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, footer, anchor);
    			append_hydration_dev(footer, div11);
    			append_hydration_dev(div11, div0);
    			append_hydration_dev(div0, img0);
    			append_hydration_dev(div11, t0);
    			append_hydration_dev(div11, div7);
    			append_hydration_dev(div7, h1);
    			append_hydration_dev(h1, t1);
    			append_hydration_dev(div7, t2);
    			append_hydration_dev(div7, ul);
    			append_hydration_dev(ul, li0);
    			append_hydration_dev(li0, a0);
    			append_hydration_dev(a0, h20);
    			append_hydration_dev(h20, t3);
    			append_hydration_dev(ul, t4);
    			append_hydration_dev(ul, div1);
    			append_hydration_dev(ul, t5);
    			append_hydration_dev(ul, li1);
    			append_hydration_dev(li1, a1);
    			append_hydration_dev(a1, h21);
    			append_hydration_dev(h21, t6);
    			append_hydration_dev(div7, t7);
    			append_hydration_dev(div7, div5);
    			append_hydration_dev(div5, div2);
    			append_hydration_dev(div2, p0);
    			append_hydration_dev(p0, t8);
    			append_hydration_dev(div2, t9);
    			append_hydration_dev(div2, a2);
    			append_hydration_dev(a2, img1);
    			append_hydration_dev(div5, t10);
    			append_hydration_dev(div5, div3);
    			append_hydration_dev(div3, p1);
    			append_hydration_dev(p1, t11);
    			append_hydration_dev(div3, t12);
    			append_hydration_dev(div3, a3);
    			append_hydration_dev(a3, img2);
    			append_hydration_dev(div5, t13);
    			append_hydration_dev(div5, div4);
    			append_hydration_dev(div4, p2);
    			append_hydration_dev(p2, t14);
    			append_hydration_dev(div4, t15);
    			append_hydration_dev(div4, a4);
    			append_hydration_dev(a4, img3);
    			append_hydration_dev(div4, t16);
    			append_hydration_dev(div4, a5);
    			append_hydration_dev(a5, img4);
    			append_hydration_dev(div4, t17);
    			append_hydration_dev(div4, a6);
    			append_hydration_dev(a6, img5);
    			append_hydration_dev(div4, t18);
    			append_hydration_dev(div4, a7);
    			append_hydration_dev(a7, img6);
    			append_hydration_dev(div7, t19);
    			append_hydration_dev(div7, div6);
    			append_hydration_dev(div6, p3);
    			append_hydration_dev(p3, t20);
    			append_hydration_dev(p3, br0);
    			append_hydration_dev(p3, t21);
    			append_hydration_dev(p3, br1);
    			append_hydration_dev(p3, t22);
    			append_hydration_dev(p3, br2);
    			append_hydration_dev(p3, t23);
    			append_hydration_dev(div11, t24);
    			append_hydration_dev(div11, div9);
    			append_hydration_dev(div9, div8);
    			append_hydration_dev(div11, t25);
    			append_hydration_dev(div11, div10);
    			append_hydration_dev(footer, t26);
    			append_hydration_dev(footer, div13);
    			append_hydration_dev(div13, div12);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/Contact.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/pages/Contact.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let link;
    	let t0;
    	let main;
    	let headersec;
    	let t1;
    	let contactstext;
    	let t2;
    	let div;
    	let t3;
    	let footer;
    	let current;
    	headersec = new HeaderSecond({ $$inline: true });
    	contactstext = new ContactsText({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(headersec.$$.fragment);
    			t1 = space();
    			create_component(contactstext.$$.fragment);
    			t2 = space();
    			div = element("div");
    			t3 = space();
    			create_component(footer.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", {});
    			var header_nodes = children(header);

    			link = claim_element(header_nodes, "LINK", {
    				href: true,
    				rel: true,
    				integrity: true,
    				crossorigin: true
    			});

    			header_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			claim_component(headersec.$$.fragment, main_nodes);
    			t1 = claim_space(main_nodes);
    			claim_component(contactstext.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			div = claim_element(main_nodes, "DIV", { style: true });
    			children(div).forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			claim_component(footer.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "integrity", "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH");
    			attr_dev(link, "crossorigin", "anonymous");
    			add_location(link, file$3, 7, 2, 208);
    			add_location(header, file$3, 6, 0, 197);
    			set_style(div, "margin", "15%");
    			add_location(div, file$3, 18, 2, 494);
    			add_location(main, file$3, 15, 0, 450);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, header, anchor);
    			append_hydration_dev(header, link);
    			insert_hydration_dev(target, t0, anchor);
    			insert_hydration_dev(target, main, anchor);
    			mount_component(headersec, main, null);
    			append_hydration_dev(main, t1);
    			mount_component(contactstext, main, null);
    			append_hydration_dev(main, t2);
    			append_hydration_dev(main, div);
    			append_hydration_dev(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headersec.$$.fragment, local);
    			transition_in(contactstext.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headersec.$$.fragment, local);
    			transition_out(contactstext.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(headersec);
    			destroy_component(contactstext);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ HeaderSec: HeaderSecond, ContactsText, Footer });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/ItemPhoto.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/ItemPhoto.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let h1;
    	let t1;
    	let t2;
    	let div2;
    	let div1;
    	let figure0;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let figure1;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let figure2;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let figure3;
    	let img4;
    	let img4_src_value;
    	let t6;
    	let figure4;
    	let img5;
    	let img5_src_value;
    	let t7;
    	let figure5;
    	let img6;
    	let img6_src_value;
    	let t8;
    	let figure6;
    	let img7;
    	let img7_src_value;
    	let t9;
    	let div4;
    	let div3;
    	let figure7;
    	let img8;
    	let img8_src_value;
    	let t10;
    	let figure8;
    	let img9;
    	let img9_src_value;
    	let t11;
    	let figure9;
    	let img10;
    	let img10_src_value;
    	let t12;
    	let figure10;
    	let img11;
    	let img11_src_value;
    	let t13;
    	let figure11;
    	let img12;
    	let img12_src_value;
    	let t14;
    	let div6;
    	let div5;
    	let figure12;
    	let img13;
    	let img13_src_value;
    	let t15;
    	let figure13;
    	let img14;
    	let img14_src_value;
    	let t16;
    	let figure14;
    	let img15;
    	let img15_src_value;
    	let t17;
    	let figure15;
    	let img16;
    	let img16_src_value;
    	let t18;
    	let figure16;
    	let img17;
    	let img17_src_value;
    	let t19;
    	let figure17;
    	let img18;
    	let img18_src_value;
    	let t20;
    	let figure18;
    	let img19;
    	let img19_src_value;
    	let t21;
    	let div8;
    	let div7;
    	let figure19;
    	let img20;
    	let img20_src_value;
    	let t22;
    	let figure20;
    	let img21;
    	let img21_src_value;
    	let t23;
    	let figure21;
    	let img22;
    	let img22_src_value;
    	let t24;
    	let figure22;
    	let img23;
    	let img23_src_value;
    	let t25;
    	let figure23;
    	let img24;
    	let img24_src_value;
    	let t26;
    	let div10;
    	let div9;
    	let figure24;
    	let img25;
    	let img25_src_value;
    	let t27;
    	let figure25;
    	let img26;
    	let img26_src_value;
    	let t28;
    	let figure26;
    	let img27;
    	let img27_src_value;
    	let t29;
    	let figure27;
    	let img28;
    	let img28_src_value;
    	let t30;
    	let figure28;
    	let img29;
    	let img29_src_value;
    	let t31;
    	let div12;
    	let div11;
    	let figure29;
    	let img30;
    	let img30_src_value;
    	let t32;
    	let figure30;
    	let img31;
    	let img31_src_value;
    	let t33;
    	let figure31;
    	let img32;
    	let img32_src_value;
    	let t34;
    	let figure32;
    	let img33;
    	let img33_src_value;
    	let t35;
    	let figure33;
    	let img34;
    	let img34_src_value;
    	let t36;
    	let figure34;
    	let img35;
    	let img35_src_value;
    	let t37;
    	let figure35;
    	let img36;
    	let img36_src_value;
    	let t38;
    	let div14;
    	let div13;
    	let figure36;
    	let img37;
    	let img37_src_value;
    	let t39;
    	let figure37;
    	let img38;
    	let img38_src_value;
    	let t40;
    	let figure38;
    	let img39;
    	let img39_src_value;
    	let t41;
    	let figure39;
    	let img40;
    	let img40_src_value;
    	let t42;
    	let div16;
    	let div15;
    	let figure40;
    	let img41;
    	let img41_src_value;
    	let t43;
    	let figure41;
    	let img42;
    	let img42_src_value;
    	let t44;
    	let figure42;
    	let img43;
    	let img43_src_value;
    	let t45;
    	let figure43;
    	let img44;
    	let img44_src_value;
    	let t46;
    	let figure44;
    	let img45;
    	let img45_src_value;
    	let t47;
    	let div18;
    	let div17;
    	let figure45;
    	let img46;
    	let img46_src_value;
    	let t48;
    	let figure46;
    	let img47;
    	let img47_src_value;
    	let t49;
    	let figure47;
    	let img48;
    	let img48_src_value;
    	let t50;
    	let figure48;
    	let img49;
    	let img49_src_value;
    	let t51;
    	let figure49;
    	let img50;
    	let img50_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			t1 = text("Портфолио");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			figure0 = element("figure");
    			img1 = element("img");
    			t3 = space();
    			figure1 = element("figure");
    			img2 = element("img");
    			t4 = space();
    			figure2 = element("figure");
    			img3 = element("img");
    			t5 = space();
    			figure3 = element("figure");
    			img4 = element("img");
    			t6 = space();
    			figure4 = element("figure");
    			img5 = element("img");
    			t7 = space();
    			figure5 = element("figure");
    			img6 = element("img");
    			t8 = space();
    			figure6 = element("figure");
    			img7 = element("img");
    			t9 = space();
    			div4 = element("div");
    			div3 = element("div");
    			figure7 = element("figure");
    			img8 = element("img");
    			t10 = space();
    			figure8 = element("figure");
    			img9 = element("img");
    			t11 = space();
    			figure9 = element("figure");
    			img10 = element("img");
    			t12 = space();
    			figure10 = element("figure");
    			img11 = element("img");
    			t13 = space();
    			figure11 = element("figure");
    			img12 = element("img");
    			t14 = space();
    			div6 = element("div");
    			div5 = element("div");
    			figure12 = element("figure");
    			img13 = element("img");
    			t15 = space();
    			figure13 = element("figure");
    			img14 = element("img");
    			t16 = space();
    			figure14 = element("figure");
    			img15 = element("img");
    			t17 = space();
    			figure15 = element("figure");
    			img16 = element("img");
    			t18 = space();
    			figure16 = element("figure");
    			img17 = element("img");
    			t19 = space();
    			figure17 = element("figure");
    			img18 = element("img");
    			t20 = space();
    			figure18 = element("figure");
    			img19 = element("img");
    			t21 = space();
    			div8 = element("div");
    			div7 = element("div");
    			figure19 = element("figure");
    			img20 = element("img");
    			t22 = space();
    			figure20 = element("figure");
    			img21 = element("img");
    			t23 = space();
    			figure21 = element("figure");
    			img22 = element("img");
    			t24 = space();
    			figure22 = element("figure");
    			img23 = element("img");
    			t25 = space();
    			figure23 = element("figure");
    			img24 = element("img");
    			t26 = space();
    			div10 = element("div");
    			div9 = element("div");
    			figure24 = element("figure");
    			img25 = element("img");
    			t27 = space();
    			figure25 = element("figure");
    			img26 = element("img");
    			t28 = space();
    			figure26 = element("figure");
    			img27 = element("img");
    			t29 = space();
    			figure27 = element("figure");
    			img28 = element("img");
    			t30 = space();
    			figure28 = element("figure");
    			img29 = element("img");
    			t31 = space();
    			div12 = element("div");
    			div11 = element("div");
    			figure29 = element("figure");
    			img30 = element("img");
    			t32 = space();
    			figure30 = element("figure");
    			img31 = element("img");
    			t33 = space();
    			figure31 = element("figure");
    			img32 = element("img");
    			t34 = space();
    			figure32 = element("figure");
    			img33 = element("img");
    			t35 = space();
    			figure33 = element("figure");
    			img34 = element("img");
    			t36 = space();
    			figure34 = element("figure");
    			img35 = element("img");
    			t37 = space();
    			figure35 = element("figure");
    			img36 = element("img");
    			t38 = space();
    			div14 = element("div");
    			div13 = element("div");
    			figure36 = element("figure");
    			img37 = element("img");
    			t39 = space();
    			figure37 = element("figure");
    			img38 = element("img");
    			t40 = space();
    			figure38 = element("figure");
    			img39 = element("img");
    			t41 = space();
    			figure39 = element("figure");
    			img40 = element("img");
    			t42 = space();
    			div16 = element("div");
    			div15 = element("div");
    			figure40 = element("figure");
    			img41 = element("img");
    			t43 = space();
    			figure41 = element("figure");
    			img42 = element("img");
    			t44 = space();
    			figure42 = element("figure");
    			img43 = element("img");
    			t45 = space();
    			figure43 = element("figure");
    			img44 = element("img");
    			t46 = space();
    			figure44 = element("figure");
    			img45 = element("img");
    			t47 = space();
    			div18 = element("div");
    			div17 = element("div");
    			figure45 = element("figure");
    			img46 = element("img");
    			t48 = space();
    			figure46 = element("figure");
    			img47 = element("img");
    			t49 = space();
    			figure47 = element("figure");
    			img48 = element("img");
    			t50 = space();
    			figure48 = element("figure");
    			img49 = element("img");
    			t51 = space();
    			figure49 = element("figure");
    			img50 = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			img0 = claim_element(main_nodes, "IMG", { class: true, src: true, alt: true });
    			t0 = claim_space(main_nodes);
    			div0 = claim_element(main_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h1 = claim_element(div0_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Портфолио");
    			h1_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(main_nodes);
    			div2 = claim_element(main_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			figure0 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure0_nodes = children(figure0);
    			img1 = claim_element(figure0_nodes, "IMG", { src: true, class: true, alt: true });
    			figure0_nodes.forEach(detach_dev);
    			t3 = claim_space(div1_nodes);
    			figure1 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure1_nodes = children(figure1);
    			img2 = claim_element(figure1_nodes, "IMG", { src: true, class: true, alt: true });
    			figure1_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			figure2 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure2_nodes = children(figure2);
    			img3 = claim_element(figure2_nodes, "IMG", { src: true, class: true, alt: true });
    			figure2_nodes.forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			figure3 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure3_nodes = children(figure3);
    			img4 = claim_element(figure3_nodes, "IMG", { src: true, class: true, alt: true });
    			figure3_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			figure4 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure4_nodes = children(figure4);
    			img5 = claim_element(figure4_nodes, "IMG", { src: true, class: true, alt: true });
    			figure4_nodes.forEach(detach_dev);
    			t7 = claim_space(div1_nodes);
    			figure5 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure5_nodes = children(figure5);
    			img6 = claim_element(figure5_nodes, "IMG", { src: true, class: true, alt: true });
    			figure5_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			figure6 = claim_element(div1_nodes, "FIGURE", { class: true });
    			var figure6_nodes = children(figure6);
    			img7 = claim_element(figure6_nodes, "IMG", { src: true, class: true, alt: true });
    			figure6_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t9 = claim_space(main_nodes);
    			div4 = claim_element(main_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			figure7 = claim_element(div3_nodes, "FIGURE", { class: true });
    			var figure7_nodes = children(figure7);
    			img8 = claim_element(figure7_nodes, "IMG", { src: true, class: true, alt: true });
    			figure7_nodes.forEach(detach_dev);
    			t10 = claim_space(div3_nodes);
    			figure8 = claim_element(div3_nodes, "FIGURE", { class: true });
    			var figure8_nodes = children(figure8);
    			img9 = claim_element(figure8_nodes, "IMG", { src: true, class: true, alt: true });
    			figure8_nodes.forEach(detach_dev);
    			t11 = claim_space(div3_nodes);
    			figure9 = claim_element(div3_nodes, "FIGURE", { class: true });
    			var figure9_nodes = children(figure9);
    			img10 = claim_element(figure9_nodes, "IMG", { src: true, class: true, alt: true });
    			figure9_nodes.forEach(detach_dev);
    			t12 = claim_space(div3_nodes);
    			figure10 = claim_element(div3_nodes, "FIGURE", { class: true });
    			var figure10_nodes = children(figure10);
    			img11 = claim_element(figure10_nodes, "IMG", { src: true, class: true, alt: true });
    			figure10_nodes.forEach(detach_dev);
    			t13 = claim_space(div3_nodes);
    			figure11 = claim_element(div3_nodes, "FIGURE", { class: true });
    			var figure11_nodes = children(figure11);
    			img12 = claim_element(figure11_nodes, "IMG", { src: true, class: true, alt: true });
    			figure11_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t14 = claim_space(main_nodes);
    			div6 = claim_element(main_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			div5 = claim_element(div6_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			figure12 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure12_nodes = children(figure12);
    			img13 = claim_element(figure12_nodes, "IMG", { src: true, class: true, alt: true });
    			figure12_nodes.forEach(detach_dev);
    			t15 = claim_space(div5_nodes);
    			figure13 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure13_nodes = children(figure13);
    			img14 = claim_element(figure13_nodes, "IMG", { src: true, class: true, alt: true });
    			figure13_nodes.forEach(detach_dev);
    			t16 = claim_space(div5_nodes);
    			figure14 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure14_nodes = children(figure14);
    			img15 = claim_element(figure14_nodes, "IMG", { src: true, class: true, alt: true });
    			figure14_nodes.forEach(detach_dev);
    			t17 = claim_space(div5_nodes);
    			figure15 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure15_nodes = children(figure15);
    			img16 = claim_element(figure15_nodes, "IMG", { src: true, class: true, alt: true });
    			figure15_nodes.forEach(detach_dev);
    			t18 = claim_space(div5_nodes);
    			figure16 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure16_nodes = children(figure16);
    			img17 = claim_element(figure16_nodes, "IMG", { src: true, class: true, alt: true });
    			figure16_nodes.forEach(detach_dev);
    			t19 = claim_space(div5_nodes);
    			figure17 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure17_nodes = children(figure17);
    			img18 = claim_element(figure17_nodes, "IMG", { src: true, class: true, alt: true });
    			figure17_nodes.forEach(detach_dev);
    			t20 = claim_space(div5_nodes);
    			figure18 = claim_element(div5_nodes, "FIGURE", { class: true });
    			var figure18_nodes = children(figure18);
    			img19 = claim_element(figure18_nodes, "IMG", { src: true, class: true, alt: true });
    			figure18_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			t21 = claim_space(main_nodes);
    			div8 = claim_element(main_nodes, "DIV", { class: true });
    			var div8_nodes = children(div8);
    			div7 = claim_element(div8_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			figure19 = claim_element(div7_nodes, "FIGURE", { class: true });
    			var figure19_nodes = children(figure19);
    			img20 = claim_element(figure19_nodes, "IMG", { src: true, class: true, alt: true });
    			figure19_nodes.forEach(detach_dev);
    			t22 = claim_space(div7_nodes);
    			figure20 = claim_element(div7_nodes, "FIGURE", { class: true });
    			var figure20_nodes = children(figure20);
    			img21 = claim_element(figure20_nodes, "IMG", { src: true, class: true, alt: true });
    			figure20_nodes.forEach(detach_dev);
    			t23 = claim_space(div7_nodes);
    			figure21 = claim_element(div7_nodes, "FIGURE", { class: true });
    			var figure21_nodes = children(figure21);
    			img22 = claim_element(figure21_nodes, "IMG", { src: true, class: true, alt: true });
    			figure21_nodes.forEach(detach_dev);
    			t24 = claim_space(div7_nodes);
    			figure22 = claim_element(div7_nodes, "FIGURE", { class: true });
    			var figure22_nodes = children(figure22);
    			img23 = claim_element(figure22_nodes, "IMG", { src: true, class: true, alt: true });
    			figure22_nodes.forEach(detach_dev);
    			t25 = claim_space(div7_nodes);
    			figure23 = claim_element(div7_nodes, "FIGURE", { class: true });
    			var figure23_nodes = children(figure23);
    			img24 = claim_element(figure23_nodes, "IMG", { src: true, class: true, alt: true });
    			figure23_nodes.forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			div8_nodes.forEach(detach_dev);
    			t26 = claim_space(main_nodes);
    			div10 = claim_element(main_nodes, "DIV", { class: true });
    			var div10_nodes = children(div10);
    			div9 = claim_element(div10_nodes, "DIV", { class: true });
    			var div9_nodes = children(div9);
    			figure24 = claim_element(div9_nodes, "FIGURE", { class: true });
    			var figure24_nodes = children(figure24);
    			img25 = claim_element(figure24_nodes, "IMG", { src: true, class: true, alt: true });
    			figure24_nodes.forEach(detach_dev);
    			t27 = claim_space(div9_nodes);
    			figure25 = claim_element(div9_nodes, "FIGURE", { class: true });
    			var figure25_nodes = children(figure25);
    			img26 = claim_element(figure25_nodes, "IMG", { src: true, class: true, alt: true });
    			figure25_nodes.forEach(detach_dev);
    			t28 = claim_space(div9_nodes);
    			figure26 = claim_element(div9_nodes, "FIGURE", { class: true });
    			var figure26_nodes = children(figure26);
    			img27 = claim_element(figure26_nodes, "IMG", { src: true, class: true, alt: true });
    			figure26_nodes.forEach(detach_dev);
    			t29 = claim_space(div9_nodes);
    			figure27 = claim_element(div9_nodes, "FIGURE", { class: true });
    			var figure27_nodes = children(figure27);
    			img28 = claim_element(figure27_nodes, "IMG", { src: true, class: true, alt: true });
    			figure27_nodes.forEach(detach_dev);
    			t30 = claim_space(div9_nodes);
    			figure28 = claim_element(div9_nodes, "FIGURE", { class: true });
    			var figure28_nodes = children(figure28);
    			img29 = claim_element(figure28_nodes, "IMG", { src: true, class: true, alt: true });
    			figure28_nodes.forEach(detach_dev);
    			div9_nodes.forEach(detach_dev);
    			div10_nodes.forEach(detach_dev);
    			t31 = claim_space(main_nodes);
    			div12 = claim_element(main_nodes, "DIV", { class: true });
    			var div12_nodes = children(div12);
    			div11 = claim_element(div12_nodes, "DIV", { class: true });
    			var div11_nodes = children(div11);
    			figure29 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure29_nodes = children(figure29);
    			img30 = claim_element(figure29_nodes, "IMG", { src: true, class: true, alt: true });
    			figure29_nodes.forEach(detach_dev);
    			t32 = claim_space(div11_nodes);
    			figure30 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure30_nodes = children(figure30);
    			img31 = claim_element(figure30_nodes, "IMG", { src: true, class: true, alt: true });
    			figure30_nodes.forEach(detach_dev);
    			t33 = claim_space(div11_nodes);
    			figure31 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure31_nodes = children(figure31);
    			img32 = claim_element(figure31_nodes, "IMG", { src: true, class: true, alt: true });
    			figure31_nodes.forEach(detach_dev);
    			t34 = claim_space(div11_nodes);
    			figure32 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure32_nodes = children(figure32);
    			img33 = claim_element(figure32_nodes, "IMG", { src: true, class: true, alt: true });
    			figure32_nodes.forEach(detach_dev);
    			t35 = claim_space(div11_nodes);
    			figure33 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure33_nodes = children(figure33);
    			img34 = claim_element(figure33_nodes, "IMG", { src: true, class: true, alt: true });
    			figure33_nodes.forEach(detach_dev);
    			t36 = claim_space(div11_nodes);
    			figure34 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure34_nodes = children(figure34);
    			img35 = claim_element(figure34_nodes, "IMG", { src: true, class: true, alt: true });
    			figure34_nodes.forEach(detach_dev);
    			t37 = claim_space(div11_nodes);
    			figure35 = claim_element(div11_nodes, "FIGURE", { class: true });
    			var figure35_nodes = children(figure35);
    			img36 = claim_element(figure35_nodes, "IMG", { src: true, class: true, alt: true });
    			figure35_nodes.forEach(detach_dev);
    			div11_nodes.forEach(detach_dev);
    			div12_nodes.forEach(detach_dev);
    			t38 = claim_space(main_nodes);
    			div14 = claim_element(main_nodes, "DIV", { class: true });
    			var div14_nodes = children(div14);
    			div13 = claim_element(div14_nodes, "DIV", { class: true });
    			var div13_nodes = children(div13);
    			figure36 = claim_element(div13_nodes, "FIGURE", { class: true });
    			var figure36_nodes = children(figure36);
    			img37 = claim_element(figure36_nodes, "IMG", { src: true, class: true, alt: true });
    			figure36_nodes.forEach(detach_dev);
    			t39 = claim_space(div13_nodes);
    			figure37 = claim_element(div13_nodes, "FIGURE", { class: true });
    			var figure37_nodes = children(figure37);
    			img38 = claim_element(figure37_nodes, "IMG", { src: true, class: true, alt: true });
    			figure37_nodes.forEach(detach_dev);
    			t40 = claim_space(div13_nodes);
    			figure38 = claim_element(div13_nodes, "FIGURE", { class: true });
    			var figure38_nodes = children(figure38);
    			img39 = claim_element(figure38_nodes, "IMG", { src: true, class: true, alt: true });
    			figure38_nodes.forEach(detach_dev);
    			t41 = claim_space(div13_nodes);
    			figure39 = claim_element(div13_nodes, "FIGURE", { class: true });
    			var figure39_nodes = children(figure39);
    			img40 = claim_element(figure39_nodes, "IMG", { src: true, class: true, alt: true });
    			figure39_nodes.forEach(detach_dev);
    			div13_nodes.forEach(detach_dev);
    			div14_nodes.forEach(detach_dev);
    			t42 = claim_space(main_nodes);
    			div16 = claim_element(main_nodes, "DIV", { class: true });
    			var div16_nodes = children(div16);
    			div15 = claim_element(div16_nodes, "DIV", { class: true });
    			var div15_nodes = children(div15);
    			figure40 = claim_element(div15_nodes, "FIGURE", { class: true });
    			var figure40_nodes = children(figure40);
    			img41 = claim_element(figure40_nodes, "IMG", { src: true, class: true, alt: true });
    			figure40_nodes.forEach(detach_dev);
    			t43 = claim_space(div15_nodes);
    			figure41 = claim_element(div15_nodes, "FIGURE", { class: true });
    			var figure41_nodes = children(figure41);
    			img42 = claim_element(figure41_nodes, "IMG", { src: true, class: true, alt: true });
    			figure41_nodes.forEach(detach_dev);
    			t44 = claim_space(div15_nodes);
    			figure42 = claim_element(div15_nodes, "FIGURE", { class: true });
    			var figure42_nodes = children(figure42);
    			img43 = claim_element(figure42_nodes, "IMG", { src: true, class: true, alt: true });
    			figure42_nodes.forEach(detach_dev);
    			t45 = claim_space(div15_nodes);
    			figure43 = claim_element(div15_nodes, "FIGURE", { class: true });
    			var figure43_nodes = children(figure43);
    			img44 = claim_element(figure43_nodes, "IMG", { src: true, class: true, alt: true });
    			figure43_nodes.forEach(detach_dev);
    			t46 = claim_space(div15_nodes);
    			figure44 = claim_element(div15_nodes, "FIGURE", { class: true });
    			var figure44_nodes = children(figure44);
    			img45 = claim_element(figure44_nodes, "IMG", { src: true, class: true, alt: true });
    			figure44_nodes.forEach(detach_dev);
    			div15_nodes.forEach(detach_dev);
    			div16_nodes.forEach(detach_dev);
    			t47 = claim_space(main_nodes);
    			div18 = claim_element(main_nodes, "DIV", { class: true });
    			var div18_nodes = children(div18);
    			div17 = claim_element(div18_nodes, "DIV", { class: true });
    			var div17_nodes = children(div17);
    			figure45 = claim_element(div17_nodes, "FIGURE", { class: true });
    			var figure45_nodes = children(figure45);
    			img46 = claim_element(figure45_nodes, "IMG", { src: true, class: true, alt: true });
    			figure45_nodes.forEach(detach_dev);
    			t48 = claim_space(div17_nodes);
    			figure46 = claim_element(div17_nodes, "FIGURE", { class: true });
    			var figure46_nodes = children(figure46);
    			img47 = claim_element(figure46_nodes, "IMG", { src: true, class: true, alt: true });
    			figure46_nodes.forEach(detach_dev);
    			t49 = claim_space(div17_nodes);
    			figure47 = claim_element(div17_nodes, "FIGURE", { class: true });
    			var figure47_nodes = children(figure47);
    			img48 = claim_element(figure47_nodes, "IMG", { src: true, class: true, alt: true });
    			figure47_nodes.forEach(detach_dev);
    			t50 = claim_space(div17_nodes);
    			figure48 = claim_element(div17_nodes, "FIGURE", { class: true });
    			var figure48_nodes = children(figure48);
    			img49 = claim_element(figure48_nodes, "IMG", { src: true, class: true, alt: true });
    			figure48_nodes.forEach(detach_dev);
    			t51 = claim_space(div17_nodes);
    			figure49 = claim_element(div17_nodes, "FIGURE", { class: true });
    			var figure49_nodes = children(figure49);
    			img50 = claim_element(figure49_nodes, "IMG", { src: true, class: true, alt: true });
    			figure49_nodes.forEach(detach_dev);
    			div17_nodes.forEach(detach_dev);
    			div18_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img0, "class", "imgBack svelte-rj15cx");
    			if (!src_url_equal(img0.src, img0_src_value = "img/back2.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "back");
    			add_location(img0, file$2, 4, 4, 31);
    			attr_dev(h1, "class", "textMainCont svelte-rj15cx");
    			add_location(h1, file$2, 6, 8, 127);
    			attr_dev(div0, "class", "text-container svelte-rj15cx");
    			add_location(div0, file$2, 5, 4, 90);
    			if (!src_url_equal(img1.src, img1_src_value = "img/photoItems/img1.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img1, "alt", "img1");
    			add_location(img1, file$2, 11, 16, 316);
    			attr_dev(figure0, "class", "gallery__item gallery__item--1 svelte-rj15cx");
    			add_location(figure0, file$2, 10, 12, 252);
    			if (!src_url_equal(img2.src, img2_src_value = "img/photoItems/img2.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img2, "alt", "img2");
    			add_location(img2, file$2, 18, 16, 560);
    			attr_dev(figure1, "class", "gallery__item gallery__item--2 svelte-rj15cx");
    			add_location(figure1, file$2, 17, 12, 496);
    			if (!src_url_equal(img3.src, img3_src_value = "img/photoItems/img3.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img3, "alt", "img3");
    			add_location(img3, file$2, 25, 16, 804);
    			attr_dev(figure2, "class", "gallery__item gallery__item--3 svelte-rj15cx");
    			add_location(figure2, file$2, 24, 12, 740);
    			if (!src_url_equal(img4.src, img4_src_value = "img/photoItems/img4.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img4, "alt", "img4");
    			add_location(img4, file$2, 32, 16, 1048);
    			attr_dev(figure3, "class", "gallery__item gallery__item--4 svelte-rj15cx");
    			add_location(figure3, file$2, 31, 12, 984);
    			if (!src_url_equal(img5.src, img5_src_value = "img/photoItems/img5.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img5, "alt", "img5");
    			add_location(img5, file$2, 39, 16, 1292);
    			attr_dev(figure4, "class", "gallery__item gallery__item--5 svelte-rj15cx");
    			add_location(figure4, file$2, 38, 12, 1228);
    			if (!src_url_equal(img6.src, img6_src_value = "img/photoItems/img6.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img6, "alt", "img6");
    			add_location(img6, file$2, 46, 16, 1536);
    			attr_dev(figure5, "class", "gallery__item gallery__item--6 svelte-rj15cx");
    			add_location(figure5, file$2, 45, 12, 1472);
    			if (!src_url_equal(img7.src, img7_src_value = "img/photoItems/img7.svg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img7, "alt", "img7");
    			add_location(img7, file$2, 53, 16, 1780);
    			attr_dev(figure6, "class", "gallery__item gallery__item--7 svelte-rj15cx");
    			add_location(figure6, file$2, 52, 12, 1716);
    			attr_dev(div1, "class", "gallery svelte-rj15cx");
    			add_location(div1, file$2, 9, 8, 218);
    			attr_dev(div2, "class", "containerDiv1 svelte-rj15cx");
    			add_location(div2, file$2, 8, 4, 182);
    			if (!src_url_equal(img8.src, img8_src_value = "img/photoItems/img8.svg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img8, "alt", "img8");
    			add_location(img8, file$2, 64, 16, 2112);
    			attr_dev(figure7, "class", "gallery__item gallery__item--8 svelte-rj15cx");
    			add_location(figure7, file$2, 63, 12, 2048);
    			if (!src_url_equal(img9.src, img9_src_value = "img/photoItems/img9.svg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img9, "alt", "img9");
    			add_location(img9, file$2, 71, 16, 2356);
    			attr_dev(figure8, "class", "gallery__item gallery__item--9 svelte-rj15cx");
    			add_location(figure8, file$2, 70, 12, 2292);
    			if (!src_url_equal(img10.src, img10_src_value = "img/photoItems/img10.svg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img10, "alt", "img10");
    			add_location(img10, file$2, 78, 16, 2601);
    			attr_dev(figure9, "class", "gallery__item gallery__item--10 svelte-rj15cx");
    			add_location(figure9, file$2, 77, 12, 2536);
    			if (!src_url_equal(img11.src, img11_src_value = "img/photoItems/img11.svg")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img11, "alt", "img11");
    			add_location(img11, file$2, 85, 16, 2848);
    			attr_dev(figure10, "class", "gallery__item gallery__item--11 svelte-rj15cx");
    			add_location(figure10, file$2, 84, 12, 2783);
    			if (!src_url_equal(img12.src, img12_src_value = "img/photoItems/img12.svg")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img12, "alt", "img12");
    			add_location(img12, file$2, 92, 16, 3095);
    			attr_dev(figure11, "class", "gallery__item gallery__item--12 svelte-rj15cx");
    			add_location(figure11, file$2, 91, 12, 3030);
    			attr_dev(div3, "class", "gallery svelte-rj15cx");
    			add_location(div3, file$2, 62, 8, 2014);
    			attr_dev(div4, "class", "containerDiv2 svelte-rj15cx");
    			add_location(div4, file$2, 61, 4, 1978);
    			if (!src_url_equal(img13.src, img13_src_value = "img/photoItems/img13.svg")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img13, "alt", "img13");
    			add_location(img13, file$2, 103, 16, 3430);
    			attr_dev(figure12, "class", "gallery__item gallery__item--13 svelte-rj15cx");
    			add_location(figure12, file$2, 102, 12, 3365);
    			if (!src_url_equal(img14.src, img14_src_value = "img/photoItems/img14.svg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img14, "alt", "img14");
    			add_location(img14, file$2, 110, 16, 3677);
    			attr_dev(figure13, "class", "gallery__item gallery__item--14 svelte-rj15cx");
    			add_location(figure13, file$2, 109, 12, 3612);
    			if (!src_url_equal(img15.src, img15_src_value = "img/photoItems/img15.svg")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img15, "alt", "img15");
    			add_location(img15, file$2, 117, 16, 3924);
    			attr_dev(figure14, "class", "gallery__item gallery__item--15 svelte-rj15cx");
    			add_location(figure14, file$2, 116, 12, 3859);
    			if (!src_url_equal(img16.src, img16_src_value = "img/photoItems/img16.svg")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img16, "alt", "img16");
    			add_location(img16, file$2, 124, 16, 4171);
    			attr_dev(figure15, "class", "gallery__item gallery__item--16 svelte-rj15cx");
    			add_location(figure15, file$2, 123, 12, 4106);
    			if (!src_url_equal(img17.src, img17_src_value = "img/photoItems/img17.svg")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img17, "alt", "img17");
    			add_location(img17, file$2, 131, 16, 4418);
    			attr_dev(figure16, "class", "gallery__item gallery__item--17 svelte-rj15cx");
    			add_location(figure16, file$2, 130, 12, 4353);
    			if (!src_url_equal(img18.src, img18_src_value = "img/photoItems/img18.svg")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img18, "alt", "img18");
    			add_location(img18, file$2, 138, 16, 4665);
    			attr_dev(figure17, "class", "gallery__item gallery__item--18 svelte-rj15cx");
    			add_location(figure17, file$2, 137, 12, 4600);
    			if (!src_url_equal(img19.src, img19_src_value = "img/photoItems/img19.svg")) attr_dev(img19, "src", img19_src_value);
    			attr_dev(img19, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img19, "alt", "img19");
    			add_location(img19, file$2, 145, 16, 4912);
    			attr_dev(figure18, "class", "gallery__item gallery__item--19 svelte-rj15cx");
    			add_location(figure18, file$2, 144, 12, 4847);
    			attr_dev(div5, "class", "gallery svelte-rj15cx");
    			add_location(div5, file$2, 101, 8, 3331);
    			attr_dev(div6, "class", "containerDiv3 svelte-rj15cx");
    			add_location(div6, file$2, 100, 4, 3295);
    			if (!src_url_equal(img20.src, img20_src_value = "img/photoItems/img20.svg")) attr_dev(img20, "src", img20_src_value);
    			attr_dev(img20, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img20, "alt", "img20");
    			add_location(img20, file$2, 156, 16, 5247);
    			attr_dev(figure19, "class", "gallery__item gallery__item--20 svelte-rj15cx");
    			add_location(figure19, file$2, 155, 12, 5182);
    			if (!src_url_equal(img21.src, img21_src_value = "img/photoItems/img21.svg")) attr_dev(img21, "src", img21_src_value);
    			attr_dev(img21, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img21, "alt", "img21");
    			add_location(img21, file$2, 163, 16, 5494);
    			attr_dev(figure20, "class", "gallery__item gallery__item--21 svelte-rj15cx");
    			add_location(figure20, file$2, 162, 12, 5429);
    			if (!src_url_equal(img22.src, img22_src_value = "img/photoItems/img22.svg")) attr_dev(img22, "src", img22_src_value);
    			attr_dev(img22, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img22, "alt", "img22");
    			add_location(img22, file$2, 170, 16, 5741);
    			attr_dev(figure21, "class", "gallery__item gallery__item--22 svelte-rj15cx");
    			add_location(figure21, file$2, 169, 12, 5676);
    			if (!src_url_equal(img23.src, img23_src_value = "img/photoItems/img23.svg")) attr_dev(img23, "src", img23_src_value);
    			attr_dev(img23, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img23, "alt", "img23");
    			add_location(img23, file$2, 177, 16, 5988);
    			attr_dev(figure22, "class", "gallery__item gallery__item--23 svelte-rj15cx");
    			add_location(figure22, file$2, 176, 12, 5923);
    			if (!src_url_equal(img24.src, img24_src_value = "img/photoItems/img24.svg")) attr_dev(img24, "src", img24_src_value);
    			attr_dev(img24, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img24, "alt", "img24");
    			add_location(img24, file$2, 184, 16, 6235);
    			attr_dev(figure23, "class", "gallery__item gallery__item--24 svelte-rj15cx");
    			add_location(figure23, file$2, 183, 12, 6170);
    			attr_dev(div7, "class", "gallery svelte-rj15cx");
    			add_location(div7, file$2, 154, 8, 5148);
    			attr_dev(div8, "class", "containerDiv4 svelte-rj15cx");
    			add_location(div8, file$2, 153, 4, 5112);
    			if (!src_url_equal(img25.src, img25_src_value = "img/photoItems/img25.svg")) attr_dev(img25, "src", img25_src_value);
    			attr_dev(img25, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img25, "alt", "img25");
    			add_location(img25, file$2, 195, 16, 6570);
    			attr_dev(figure24, "class", "gallery__item gallery__item--25 svelte-rj15cx");
    			add_location(figure24, file$2, 194, 12, 6505);
    			if (!src_url_equal(img26.src, img26_src_value = "img/photoItems/img26.svg")) attr_dev(img26, "src", img26_src_value);
    			attr_dev(img26, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img26, "alt", "img26");
    			add_location(img26, file$2, 202, 16, 6817);
    			attr_dev(figure25, "class", "gallery__item gallery__item--26 svelte-rj15cx");
    			add_location(figure25, file$2, 201, 12, 6752);
    			if (!src_url_equal(img27.src, img27_src_value = "img/photoItems/img27.svg")) attr_dev(img27, "src", img27_src_value);
    			attr_dev(img27, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img27, "alt", "img27");
    			add_location(img27, file$2, 209, 16, 7064);
    			attr_dev(figure26, "class", "gallery__item gallery__item--27 svelte-rj15cx");
    			add_location(figure26, file$2, 208, 12, 6999);
    			if (!src_url_equal(img28.src, img28_src_value = "img/photoItems/img28.svg")) attr_dev(img28, "src", img28_src_value);
    			attr_dev(img28, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img28, "alt", "img28");
    			add_location(img28, file$2, 216, 16, 7311);
    			attr_dev(figure27, "class", "gallery__item gallery__item--28 svelte-rj15cx");
    			add_location(figure27, file$2, 215, 12, 7246);
    			if (!src_url_equal(img29.src, img29_src_value = "img/photoItems/img29.svg")) attr_dev(img29, "src", img29_src_value);
    			attr_dev(img29, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img29, "alt", "img29");
    			add_location(img29, file$2, 223, 16, 7558);
    			attr_dev(figure28, "class", "gallery__item gallery__item--29 svelte-rj15cx");
    			add_location(figure28, file$2, 222, 12, 7493);
    			attr_dev(div9, "class", "gallery svelte-rj15cx");
    			add_location(div9, file$2, 193, 8, 6471);
    			attr_dev(div10, "class", "containerDiv5 svelte-rj15cx");
    			add_location(div10, file$2, 192, 4, 6435);
    			if (!src_url_equal(img30.src, img30_src_value = "img/photoItems/img30.svg")) attr_dev(img30, "src", img30_src_value);
    			attr_dev(img30, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img30, "alt", "img30");
    			add_location(img30, file$2, 234, 16, 7893);
    			attr_dev(figure29, "class", "gallery__item gallery__item--30 svelte-rj15cx");
    			add_location(figure29, file$2, 233, 12, 7828);
    			if (!src_url_equal(img31.src, img31_src_value = "img/photoItems/img31.svg")) attr_dev(img31, "src", img31_src_value);
    			attr_dev(img31, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img31, "alt", "img31");
    			add_location(img31, file$2, 241, 16, 8140);
    			attr_dev(figure30, "class", "gallery__item gallery__item--31 svelte-rj15cx");
    			add_location(figure30, file$2, 240, 12, 8075);
    			if (!src_url_equal(img32.src, img32_src_value = "img/photoItems/img32.svg")) attr_dev(img32, "src", img32_src_value);
    			attr_dev(img32, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img32, "alt", "img32");
    			add_location(img32, file$2, 248, 16, 8387);
    			attr_dev(figure31, "class", "gallery__item gallery__item--32 svelte-rj15cx");
    			add_location(figure31, file$2, 247, 12, 8322);
    			if (!src_url_equal(img33.src, img33_src_value = "img/photoItems/img33.svg")) attr_dev(img33, "src", img33_src_value);
    			attr_dev(img33, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img33, "alt", "img33");
    			add_location(img33, file$2, 255, 16, 8634);
    			attr_dev(figure32, "class", "gallery__item gallery__item--33 svelte-rj15cx");
    			add_location(figure32, file$2, 254, 12, 8569);
    			if (!src_url_equal(img34.src, img34_src_value = "img/photoItems/img34.svg")) attr_dev(img34, "src", img34_src_value);
    			attr_dev(img34, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img34, "alt", "img34");
    			add_location(img34, file$2, 262, 16, 8881);
    			attr_dev(figure33, "class", "gallery__item gallery__item--34 svelte-rj15cx");
    			add_location(figure33, file$2, 261, 12, 8816);
    			if (!src_url_equal(img35.src, img35_src_value = "img/photoItems/img35.svg")) attr_dev(img35, "src", img35_src_value);
    			attr_dev(img35, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img35, "alt", "img35");
    			add_location(img35, file$2, 269, 16, 9128);
    			attr_dev(figure34, "class", "gallery__item gallery__item--35 svelte-rj15cx");
    			add_location(figure34, file$2, 268, 12, 9063);
    			if (!src_url_equal(img36.src, img36_src_value = "img/photoItems/img36.svg")) attr_dev(img36, "src", img36_src_value);
    			attr_dev(img36, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img36, "alt", "img36");
    			add_location(img36, file$2, 276, 16, 9375);
    			attr_dev(figure35, "class", "gallery__item gallery__item--36 svelte-rj15cx");
    			add_location(figure35, file$2, 275, 12, 9310);
    			attr_dev(div11, "class", "gallery svelte-rj15cx");
    			add_location(div11, file$2, 232, 8, 7794);
    			attr_dev(div12, "class", "containerDiv6 svelte-rj15cx");
    			add_location(div12, file$2, 231, 4, 7758);
    			if (!src_url_equal(img37.src, img37_src_value = "img/photoItems/img37.svg")) attr_dev(img37, "src", img37_src_value);
    			attr_dev(img37, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img37, "alt", "img37");
    			add_location(img37, file$2, 287, 16, 9710);
    			attr_dev(figure36, "class", "gallery__item gallery__item--37 svelte-rj15cx");
    			add_location(figure36, file$2, 286, 12, 9645);
    			if (!src_url_equal(img38.src, img38_src_value = "img/photoItems/img38.svg")) attr_dev(img38, "src", img38_src_value);
    			attr_dev(img38, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img38, "alt", "img38");
    			add_location(img38, file$2, 294, 16, 9957);
    			attr_dev(figure37, "class", "gallery__item gallery__item--38 svelte-rj15cx");
    			add_location(figure37, file$2, 293, 12, 9892);
    			if (!src_url_equal(img39.src, img39_src_value = "img/photoItems/img39.svg")) attr_dev(img39, "src", img39_src_value);
    			attr_dev(img39, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img39, "alt", "img39");
    			add_location(img39, file$2, 301, 16, 10204);
    			attr_dev(figure38, "class", "gallery__item gallery__item--39 svelte-rj15cx");
    			add_location(figure38, file$2, 300, 12, 10139);
    			if (!src_url_equal(img40.src, img40_src_value = "img/photoItems/img40.svg")) attr_dev(img40, "src", img40_src_value);
    			attr_dev(img40, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img40, "alt", "img40");
    			add_location(img40, file$2, 308, 16, 10451);
    			attr_dev(figure39, "class", "gallery__item gallery__item--40 svelte-rj15cx");
    			add_location(figure39, file$2, 307, 12, 10386);
    			attr_dev(div13, "class", "gallery svelte-rj15cx");
    			add_location(div13, file$2, 285, 8, 9611);
    			attr_dev(div14, "class", "containerDiv7 svelte-rj15cx");
    			add_location(div14, file$2, 284, 4, 9575);
    			if (!src_url_equal(img41.src, img41_src_value = "img/photoItems/img41.svg")) attr_dev(img41, "src", img41_src_value);
    			attr_dev(img41, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img41, "alt", "img41");
    			add_location(img41, file$2, 319, 16, 10786);
    			attr_dev(figure40, "class", "gallery__item gallery__item--41 svelte-rj15cx");
    			add_location(figure40, file$2, 318, 12, 10721);
    			if (!src_url_equal(img42.src, img42_src_value = "img/photoItems/img42.svg")) attr_dev(img42, "src", img42_src_value);
    			attr_dev(img42, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img42, "alt", "img42");
    			add_location(img42, file$2, 326, 16, 11033);
    			attr_dev(figure41, "class", "gallery__item gallery__item--42 svelte-rj15cx");
    			add_location(figure41, file$2, 325, 12, 10968);
    			if (!src_url_equal(img43.src, img43_src_value = "img/photoItems/img43.svg")) attr_dev(img43, "src", img43_src_value);
    			attr_dev(img43, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img43, "alt", "img43");
    			add_location(img43, file$2, 333, 16, 11280);
    			attr_dev(figure42, "class", "gallery__item gallery__item--43 svelte-rj15cx");
    			add_location(figure42, file$2, 332, 12, 11215);
    			if (!src_url_equal(img44.src, img44_src_value = "img/photoItems/img44.svg")) attr_dev(img44, "src", img44_src_value);
    			attr_dev(img44, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img44, "alt", "img44");
    			add_location(img44, file$2, 340, 16, 11527);
    			attr_dev(figure43, "class", "gallery__item gallery__item--44 svelte-rj15cx");
    			add_location(figure43, file$2, 339, 12, 11462);
    			if (!src_url_equal(img45.src, img45_src_value = "img/photoItems/img45.svg")) attr_dev(img45, "src", img45_src_value);
    			attr_dev(img45, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img45, "alt", "img45");
    			add_location(img45, file$2, 347, 16, 11774);
    			attr_dev(figure44, "class", "gallery__item gallery__item--45 svelte-rj15cx");
    			add_location(figure44, file$2, 346, 12, 11709);
    			attr_dev(div15, "class", "gallery svelte-rj15cx");
    			add_location(div15, file$2, 317, 8, 10687);
    			attr_dev(div16, "class", "containerDiv8 svelte-rj15cx");
    			add_location(div16, file$2, 316, 4, 10651);
    			if (!src_url_equal(img46.src, img46_src_value = "img/photoItems/img46.svg")) attr_dev(img46, "src", img46_src_value);
    			attr_dev(img46, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img46, "alt", "img46");
    			add_location(img46, file$2, 358, 16, 12109);
    			attr_dev(figure45, "class", "gallery__item gallery__item--46 svelte-rj15cx");
    			add_location(figure45, file$2, 357, 12, 12044);
    			if (!src_url_equal(img47.src, img47_src_value = "img/photoItems/img47.svg")) attr_dev(img47, "src", img47_src_value);
    			attr_dev(img47, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img47, "alt", "img47");
    			add_location(img47, file$2, 365, 16, 12356);
    			attr_dev(figure46, "class", "gallery__item gallery__item--47 svelte-rj15cx");
    			add_location(figure46, file$2, 364, 12, 12291);
    			if (!src_url_equal(img48.src, img48_src_value = "img/photoItems/img48.svg")) attr_dev(img48, "src", img48_src_value);
    			attr_dev(img48, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img48, "alt", "img48");
    			add_location(img48, file$2, 372, 16, 12603);
    			attr_dev(figure47, "class", "gallery__item gallery__item--48 svelte-rj15cx");
    			add_location(figure47, file$2, 371, 12, 12538);
    			if (!src_url_equal(img49.src, img49_src_value = "img/photoItems/img49.svg")) attr_dev(img49, "src", img49_src_value);
    			attr_dev(img49, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img49, "alt", "img49");
    			add_location(img49, file$2, 379, 16, 12850);
    			attr_dev(figure48, "class", "gallery__item gallery__item--49 svelte-rj15cx");
    			add_location(figure48, file$2, 378, 12, 12785);
    			if (!src_url_equal(img50.src, img50_src_value = "img/photoItems/img50.svg")) attr_dev(img50, "src", img50_src_value);
    			attr_dev(img50, "class", "gallery__img svelte-rj15cx");
    			attr_dev(img50, "alt", "img50");
    			add_location(img50, file$2, 386, 16, 13097);
    			attr_dev(figure49, "class", "gallery__item gallery__item--50 svelte-rj15cx");
    			add_location(figure49, file$2, 385, 12, 13032);
    			attr_dev(div17, "class", "gallery svelte-rj15cx");
    			add_location(div17, file$2, 356, 8, 12010);
    			attr_dev(div18, "class", "containerDiv9 svelte-rj15cx");
    			add_location(div18, file$2, 355, 4, 11974);
    			add_location(main, file$2, 3, 0, 20);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, img0);
    			append_hydration_dev(main, t0);
    			append_hydration_dev(main, div0);
    			append_hydration_dev(div0, h1);
    			append_hydration_dev(h1, t1);
    			append_hydration_dev(main, t2);
    			append_hydration_dev(main, div2);
    			append_hydration_dev(div2, div1);
    			append_hydration_dev(div1, figure0);
    			append_hydration_dev(figure0, img1);
    			append_hydration_dev(div1, t3);
    			append_hydration_dev(div1, figure1);
    			append_hydration_dev(figure1, img2);
    			append_hydration_dev(div1, t4);
    			append_hydration_dev(div1, figure2);
    			append_hydration_dev(figure2, img3);
    			append_hydration_dev(div1, t5);
    			append_hydration_dev(div1, figure3);
    			append_hydration_dev(figure3, img4);
    			append_hydration_dev(div1, t6);
    			append_hydration_dev(div1, figure4);
    			append_hydration_dev(figure4, img5);
    			append_hydration_dev(div1, t7);
    			append_hydration_dev(div1, figure5);
    			append_hydration_dev(figure5, img6);
    			append_hydration_dev(div1, t8);
    			append_hydration_dev(div1, figure6);
    			append_hydration_dev(figure6, img7);
    			append_hydration_dev(main, t9);
    			append_hydration_dev(main, div4);
    			append_hydration_dev(div4, div3);
    			append_hydration_dev(div3, figure7);
    			append_hydration_dev(figure7, img8);
    			append_hydration_dev(div3, t10);
    			append_hydration_dev(div3, figure8);
    			append_hydration_dev(figure8, img9);
    			append_hydration_dev(div3, t11);
    			append_hydration_dev(div3, figure9);
    			append_hydration_dev(figure9, img10);
    			append_hydration_dev(div3, t12);
    			append_hydration_dev(div3, figure10);
    			append_hydration_dev(figure10, img11);
    			append_hydration_dev(div3, t13);
    			append_hydration_dev(div3, figure11);
    			append_hydration_dev(figure11, img12);
    			append_hydration_dev(main, t14);
    			append_hydration_dev(main, div6);
    			append_hydration_dev(div6, div5);
    			append_hydration_dev(div5, figure12);
    			append_hydration_dev(figure12, img13);
    			append_hydration_dev(div5, t15);
    			append_hydration_dev(div5, figure13);
    			append_hydration_dev(figure13, img14);
    			append_hydration_dev(div5, t16);
    			append_hydration_dev(div5, figure14);
    			append_hydration_dev(figure14, img15);
    			append_hydration_dev(div5, t17);
    			append_hydration_dev(div5, figure15);
    			append_hydration_dev(figure15, img16);
    			append_hydration_dev(div5, t18);
    			append_hydration_dev(div5, figure16);
    			append_hydration_dev(figure16, img17);
    			append_hydration_dev(div5, t19);
    			append_hydration_dev(div5, figure17);
    			append_hydration_dev(figure17, img18);
    			append_hydration_dev(div5, t20);
    			append_hydration_dev(div5, figure18);
    			append_hydration_dev(figure18, img19);
    			append_hydration_dev(main, t21);
    			append_hydration_dev(main, div8);
    			append_hydration_dev(div8, div7);
    			append_hydration_dev(div7, figure19);
    			append_hydration_dev(figure19, img20);
    			append_hydration_dev(div7, t22);
    			append_hydration_dev(div7, figure20);
    			append_hydration_dev(figure20, img21);
    			append_hydration_dev(div7, t23);
    			append_hydration_dev(div7, figure21);
    			append_hydration_dev(figure21, img22);
    			append_hydration_dev(div7, t24);
    			append_hydration_dev(div7, figure22);
    			append_hydration_dev(figure22, img23);
    			append_hydration_dev(div7, t25);
    			append_hydration_dev(div7, figure23);
    			append_hydration_dev(figure23, img24);
    			append_hydration_dev(main, t26);
    			append_hydration_dev(main, div10);
    			append_hydration_dev(div10, div9);
    			append_hydration_dev(div9, figure24);
    			append_hydration_dev(figure24, img25);
    			append_hydration_dev(div9, t27);
    			append_hydration_dev(div9, figure25);
    			append_hydration_dev(figure25, img26);
    			append_hydration_dev(div9, t28);
    			append_hydration_dev(div9, figure26);
    			append_hydration_dev(figure26, img27);
    			append_hydration_dev(div9, t29);
    			append_hydration_dev(div9, figure27);
    			append_hydration_dev(figure27, img28);
    			append_hydration_dev(div9, t30);
    			append_hydration_dev(div9, figure28);
    			append_hydration_dev(figure28, img29);
    			append_hydration_dev(main, t31);
    			append_hydration_dev(main, div12);
    			append_hydration_dev(div12, div11);
    			append_hydration_dev(div11, figure29);
    			append_hydration_dev(figure29, img30);
    			append_hydration_dev(div11, t32);
    			append_hydration_dev(div11, figure30);
    			append_hydration_dev(figure30, img31);
    			append_hydration_dev(div11, t33);
    			append_hydration_dev(div11, figure31);
    			append_hydration_dev(figure31, img32);
    			append_hydration_dev(div11, t34);
    			append_hydration_dev(div11, figure32);
    			append_hydration_dev(figure32, img33);
    			append_hydration_dev(div11, t35);
    			append_hydration_dev(div11, figure33);
    			append_hydration_dev(figure33, img34);
    			append_hydration_dev(div11, t36);
    			append_hydration_dev(div11, figure34);
    			append_hydration_dev(figure34, img35);
    			append_hydration_dev(div11, t37);
    			append_hydration_dev(div11, figure35);
    			append_hydration_dev(figure35, img36);
    			append_hydration_dev(main, t38);
    			append_hydration_dev(main, div14);
    			append_hydration_dev(div14, div13);
    			append_hydration_dev(div13, figure36);
    			append_hydration_dev(figure36, img37);
    			append_hydration_dev(div13, t39);
    			append_hydration_dev(div13, figure37);
    			append_hydration_dev(figure37, img38);
    			append_hydration_dev(div13, t40);
    			append_hydration_dev(div13, figure38);
    			append_hydration_dev(figure38, img39);
    			append_hydration_dev(div13, t41);
    			append_hydration_dev(div13, figure39);
    			append_hydration_dev(figure39, img40);
    			append_hydration_dev(main, t42);
    			append_hydration_dev(main, div16);
    			append_hydration_dev(div16, div15);
    			append_hydration_dev(div15, figure40);
    			append_hydration_dev(figure40, img41);
    			append_hydration_dev(div15, t43);
    			append_hydration_dev(div15, figure41);
    			append_hydration_dev(figure41, img42);
    			append_hydration_dev(div15, t44);
    			append_hydration_dev(div15, figure42);
    			append_hydration_dev(figure42, img43);
    			append_hydration_dev(div15, t45);
    			append_hydration_dev(div15, figure43);
    			append_hydration_dev(figure43, img44);
    			append_hydration_dev(div15, t46);
    			append_hydration_dev(div15, figure44);
    			append_hydration_dev(figure44, img45);
    			append_hydration_dev(main, t47);
    			append_hydration_dev(main, div18);
    			append_hydration_dev(div18, div17);
    			append_hydration_dev(div17, figure45);
    			append_hydration_dev(figure45, img46);
    			append_hydration_dev(div17, t48);
    			append_hydration_dev(div17, figure46);
    			append_hydration_dev(figure46, img47);
    			append_hydration_dev(div17, t49);
    			append_hydration_dev(div17, figure47);
    			append_hydration_dev(figure47, img48);
    			append_hydration_dev(div17, t50);
    			append_hydration_dev(div17, figure48);
    			append_hydration_dev(figure48, img49);
    			append_hydration_dev(div17, t51);
    			append_hydration_dev(div17, figure49);
    			append_hydration_dev(figure49, img50);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemPhoto', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemPhoto> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ItemPhoto extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemPhoto",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/Portfolio.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/pages/Portfolio.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let link;
    	let t0;
    	let main;
    	let headersec;
    	let t1;
    	let itemphoto;
    	let t2;
    	let div;
    	let img;
    	let img_src_value;
    	let t3;
    	let footer;
    	let current;
    	headersec = new HeaderSecond({ $$inline: true });
    	itemphoto = new ItemPhoto({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(headersec.$$.fragment);
    			t1 = space();
    			create_component(itemphoto.$$.fragment);
    			t2 = space();
    			div = element("div");
    			img = element("img");
    			t3 = space();
    			create_component(footer.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", {});
    			var header_nodes = children(header);

    			link = claim_element(header_nodes, "LINK", {
    				href: true,
    				rel: true,
    				integrity: true,
    				crossorigin: true
    			});

    			header_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			claim_component(headersec.$$.fragment, main_nodes);
    			t1 = claim_space(main_nodes);
    			claim_component(itemphoto.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			div = claim_element(main_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			img = claim_element(div_nodes, "IMG", { src: true, alt: true });
    			div_nodes.forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			claim_component(footer.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "integrity", "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH");
    			attr_dev(link, "crossorigin", "anonymous");
    			add_location(link, file$1, 7, 2, 202);
    			add_location(header, file$1, 6, 0, 191);
    			if (!src_url_equal(img.src, img_src_value = "img/square.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "square");
    			add_location(img, file$1, 17, 23, 505);
    			attr_dev(div, "class", "blocMar svelte-tf70il");
    			add_location(div, file$1, 17, 2, 484);
    			add_location(main, file$1, 14, 0, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, header, anchor);
    			append_hydration_dev(header, link);
    			insert_hydration_dev(target, t0, anchor);
    			insert_hydration_dev(target, main, anchor);
    			mount_component(headersec, main, null);
    			append_hydration_dev(main, t1);
    			mount_component(itemphoto, main, null);
    			append_hydration_dev(main, t2);
    			append_hydration_dev(main, div);
    			append_hydration_dev(div, img);
    			append_hydration_dev(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headersec.$$.fragment, local);
    			transition_in(itemphoto.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headersec.$$.fragment, local);
    			transition_out(itemphoto.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(headersec);
    			destroy_component(itemphoto);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ HeaderSec: HeaderSecond, ItemPhoto, Footer });
    	return [];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    // (21:3) <Route path="/">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(home.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(21:3) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:0) <Router url="{url}">
    function create_default_slot(ctx) {
    	let main;
    	let div;
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "Contact", component: Contact },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "Portfolio", component: Portfolio },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			div = claim_element(main_nodes, "DIV", {});
    			var div_nodes = children(div);
    			claim_component(route0.$$.fragment, div_nodes);
    			t0 = claim_space(div_nodes);
    			claim_component(route1.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(route2.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(div, file, 19, 2, 917);
    			attr_dev(main, "class", "svelte-12ddvrd");
    			add_location(main, file, 18, 1, 908);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, main, anchor);
    			append_hydration_dev(main, div);
    			mount_component(route0, div, null);
    			append_hydration_dev(div, t0);
    			mount_component(route1, div, null);
    			append_hydration_dev(div, t1);
    			mount_component(route2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(18:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let link4;
    	let t4;
    	let link5;
    	let t5;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			link3 = element("link");
    			t3 = space();
    			link4 = element("link");
    			t4 = space();
    			link5 = element("link");
    			t5 = space();
    			create_component(router.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", {});
    			var header_nodes = children(header);
    			link0 = claim_element(header_nodes, "LINK", { rel: true, href: true });
    			t0 = claim_space(header_nodes);
    			link1 = claim_element(header_nodes, "LINK", { rel: true, href: true, crossorigin: true });
    			t1 = claim_space(header_nodes);
    			link2 = claim_element(header_nodes, "LINK", { href: true, rel: true });
    			t2 = claim_space(header_nodes);
    			link3 = claim_element(header_nodes, "LINK", { rel: true, href: true });
    			t3 = claim_space(header_nodes);
    			link4 = claim_element(header_nodes, "LINK", { rel: true, href: true, crossorigin: true });
    			t4 = claim_space(header_nodes);
    			link5 = claim_element(header_nodes, "LINK", { href: true, rel: true });
    			header_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);
    			claim_component(router.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.googleapis.com");
    			add_location(link0, file, 9, 1, 246);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file, 10, 1, 307);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100;200;300&display=swap");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file, 11, 1, 377);
    			attr_dev(link3, "rel", "preconnect");
    			attr_dev(link3, "href", "https://fonts.googleapis.com");
    			add_location(link3, file, 12, 1, 539);
    			attr_dev(link4, "rel", "preconnect");
    			attr_dev(link4, "href", "https://fonts.gstatic.com");
    			attr_dev(link4, "crossorigin", "");
    			add_location(link4, file, 13, 1, 600);
    			attr_dev(link5, "href", "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100;200;300&display=swap");
    			attr_dev(link5, "rel", "stylesheet");
    			add_location(link5, file, 14, 1, 670);
    			add_location(header, file, 8, 0, 236);
    		},
    		m: function mount(target, anchor) {
    			insert_hydration_dev(target, header, anchor);
    			append_hydration_dev(header, link0);
    			append_hydration_dev(header, t0);
    			append_hydration_dev(header, link1);
    			append_hydration_dev(header, t1);
    			append_hydration_dev(header, link2);
    			append_hydration_dev(header, t2);
    			append_hydration_dev(header, link3);
    			append_hydration_dev(header, t3);
    			append_hydration_dev(header, link4);
    			append_hydration_dev(header, t4);
    			append_hydration_dev(header, link5);
    			insert_hydration_dev(target, t5, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t5);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ['url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Link,
    		Home,
    		Contact,
    		Portfolio,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	hydrate: true,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
