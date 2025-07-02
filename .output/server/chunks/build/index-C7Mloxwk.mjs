import { resolveComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Card = resolveComponent("Card");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden" }, _attrs))}><div class="fixed inset-0 pointer-events-none z-0"><div class="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div><div class="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "1s" })}"></div><div class="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "2s" })}"></div><div class="absolute top-1/2 right-20 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "0.5s" })}"></div></div><div class="relative z-10 w-full max-w-2xl mx-auto">`);
      _push(ssrRenderComponent(_component_Card, { class: "coming-soon-card text-center" }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-8 animate-fade-in-down"${_scopeId}><div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center floating-element"${_scopeId}><i class="pi pi-star text-white text-3xl"${_scopeId}></i></div><h1 class="text-2xl md:text-3xl font-semibold text-white mb-2"${_scopeId}>Savta AI</h1><p class="text-gray-300 text-lg"${_scopeId}>The Future of AI-Powered Solutions</p></div><div class="mb-8 animate-fade-in-up" style="${ssrRenderStyle({ "animation-delay": "0.3s" })}"${_scopeId}><h2 class="animated-text mb-4"${_scopeId}>Coming Soon</h2><p class="text-xl md:text-2xl text-gray-300 mb-6"${_scopeId}>Something amazing is brewing...</p></div>`);
          } else {
            return [
              createVNode("div", { class: "mb-8 animate-fade-in-down" }, [
                createVNode("div", { class: "w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center floating-element" }, [
                  createVNode("i", { class: "pi pi-star text-white text-3xl" })
                ]),
                createVNode("h1", { class: "text-2xl md:text-3xl font-semibold text-white mb-2" }, "Savta AI"),
                createVNode("p", { class: "text-gray-300 text-lg" }, "The Future of AI-Powered Solutions")
              ]),
              createVNode("div", {
                class: "mb-8 animate-fade-in-up",
                style: { "animation-delay": "0.3s" }
              }, [
                createVNode("h2", { class: "animated-text mb-4" }, "Coming Soon"),
                createVNode("p", { class: "text-xl md:text-2xl text-gray-300 mb-6" }, "Something amazing is brewing...")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C7Mloxwk.mjs.map
