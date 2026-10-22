// A separate seeded stream keeps Horizon, Nebula and quality prefixes identical.
export function refineGalaxy(galaxy, seed) {
  let state = (seed ^ 0x9e3779b9) >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return (state + 1) / 4294967297; };
  const normal = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(Math.PI * 2 * random());
  const smooth = (a,b,x) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  const hash = (x,y) => { let h=Math.imul(x,374761393)^Math.imul(y,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; };
  const noise = (x,y) => { const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(0,1,x-ix),fy=smooth(0,1,y-iy); const a=hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx,b=hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx;return a*(1-fy)+b*fy; };
  const phase = r => .6 + 2.65*Math.log(1+r*.85);
  const wrap = a => Math.atan2(Math.sin(a),Math.cos(a));

  // Rejection from a continuous disk density: unequal arms, gaps and spurs.
  const sample = () => {
    for (;;) {
      const r = .85 + Math.sqrt(random()) * 4.6, a=random()*Math.PI*2;
      const x=Math.cos(a)*r,z=Math.sin(a)*r;
      const coarse=noise(x*.8+8,z*.8+5), fine=noise(x*3.1,z*3.1);
      const bend=(coarse-.5)*.38;
      const d0=wrap(a-phase(r)-bend), d1=wrap(a-phase(r)-3.45-.16*Math.sin(r*1.4)-bend);
      const width=.14+.12*coarse+.04*r/5;
      const arms=Math.exp(-d0*d0/(width*width))+.68*Math.exp(-d1*d1/(width*width*1.6));
      const spur=wrap(a-phase(r)-.5-.22*(r-3));
      const branch=.48*Math.exp(-spur*spur/.04)*smooth(2,3,r)*(1-smooth(4.3,5.3,r));
      const inner=.22*Math.exp(-Math.pow((r-1.25)/.8,2));
      const structure=.22+1.2*smooth(.2,.75,coarse)*(.45+fine);
      const density=(.045+inner+(arms+branch)*structure)*Math.exp(-r*.18)*(1-smooth(4.5,5.45,r));
      if(random()<density/1.7) return [x,z];
    }
  };

  for(let t=0;t<galaxy.length;t+=3) {
    // Preserve the existing warm, three-dimensional bulge and inner transition.
    if(Math.hypot(galaxy[t],galaxy[t+2])<.98)continue;
    const [x,z]=sample(),r=Math.hypot(x,z),a=Math.atan2(z,x);
    galaxy[t]=x;galaxy[t+2]=z;
    galaxy[t+1]=normal()*(.055+.13*Math.exp(-r*.55))+.075*Math.sin(a*2+r*.6)*Math.pow(r/5.45,2);
  }
}
