export function topologyFile() {
  return isMobile() ? "/earth-topo-mobile.json?v3" : "/earth-topo.json?v3";
}

export let model = createModel({
  hd: undefined,
  topology: undefined
});

export function attach() {
  model.save({
    hd: false,
    topology: topologyFile()
  });
}