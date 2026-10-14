export const particleVertex = /* glsl */`
attribute vec3 aHorizon;
attribute vec3 aNebula;
attribute vec4 aSeed;
uniform float uTime;
uniform float uDpr;
uniform float uScale;
uniform vec3 uWeights;
varying vec3 vColor;
varying float vAlpha;
varying float vSpark;
mat2 rotate(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
void main() {
  vec3 g = position;
  float radius = length(g.xz);
  g.xz = rotate(uTime * .028 / (.7 + radius * .18)) * g.xz;
  vec3 h = aHorizon;
  h.xz = rotate(uTime * .17 / (.4 + length(h.xz) * .2)) * h.xz;
  vec3 n = aNebula;
  n += vec3(sin(n.y * 1.7 + uTime * .09), cos(n.z + uTime * .07), sin(n.x * 1.2 + uTime * .06)) * .13;
  vec3 p = g * uWeights.x + h * uWeights.y + n * uWeights.z;
  vec3 gc = mix(vec3(1., .69, .39), vec3(.40, .65, .86), smoothstep(.5, 5.3, radius));
  gc = mix(gc, vec3(1., .91, .73), aSeed.x * .6);
  vec3 hc = mix(vec3(1., .27, .065), vec3(1., .81, .47), aSeed.x);
  vec3 nc = mix(vec3(.17, .64, .76), vec3(.88, .35, .58), smoothstep(-1.3, 1.5, aNebula.y + aSeed.x));
  vColor = gc * uWeights.x + hc * uWeights.y + nc * uWeights.z;
  vAlpha = .3 + aSeed.y * .7;
  vSpark = step(.997, aSeed.w);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((aSeed.z + vSpark * 1.5) * uDpr * uScale * 34. / max(1., -mv.z), 1., 12. * uDpr);
}
`;

export const particleFragment = /* glsl */`
varying vec3 vColor;
varying float vAlpha;
varying float vSpark;
void main() {
  vec2 p = gl_PointCoord - .5;
  float d = length(p) * 2.;
  if(d > 1.) discard;
  float light = exp(-d*d*6.)*.55 + exp(-d*d*40.)*.75;
  float crossLight = pow(max(0.,1.-abs(p.x)*28.),3.) * exp(-abs(p.y)*12.) + pow(max(0.,1.-abs(p.y)*28.),3.) * exp(-abs(p.x)*12.);
  gl_FragColor = vec4(vColor * (1. + vSpark * .6), (light + crossLight*vSpark*.4)*vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const noise = /* glsl */`
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float value=0.,amp=.5;
  for(int i=0;i<4;i++) { value+=noise(p)*amp; p=mat2(.8,-.6,.6,.8)*p*2.03+3.7; amp*=.5; }
  return value;
}
`;

export const planeVertex = /* glsl */`
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;

export const diskFragment = /* glsl */`
uniform float uTime;
uniform vec3 uWeights;
varying vec2 vUv;
${noise}
void main() {
  vec2 p=(vUv-.5)*14.;
  float r=length(p),a=atan(p.y,p.x);
  float grain=fbm(p*3.1);
  float arms=pow(.5+.5*cos(a*4.-r*4.56+uTime*.03+(grain-.5)*.8),5.);
  float outer=1.-smoothstep(3.6,5.6,r);
  float dust=(arms*.55+.045)*exp(-r*.42)*outer*(.25+grain);
  float core=exp(-r*r*2.8)*.6;
  vec3 galaxy=mix(vec3(.20,.35,.43),vec3(.68,.44,.23),exp(-r*.9))*dust+vec3(1.,.76,.43)*core;
  float mask=smoothstep(1.1,1.3,r)*(1.-smoothstep(4.1,5.3,r));
  float lines=.65+.35*sin(r*95.+grain*5.-uTime*.5);
  float filaments=pow(.5+.5*sin(a*5.+r*24.-uTime*.5+grain*5.),3.);
  float heat=exp(-max(0.,r-1.25)*1.15)*mask;
  vec3 horizon=mix(vec3(.74,.19,.045),vec3(1.,.70,.31),exp(-max(0.,r-1.25)*1.5));
  horizon*=heat*(lines*.3+filaments*.3+.12);
  vec3 color=galaxy*uWeights.x+horizon*uWeights.y;
  gl_FragColor=vec4(color,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const cloudFragment = /* glsl */`
uniform float uTime;
uniform vec3 uWeights;
varying vec2 vUv;
${noise}
void main() {
  vec2 p=(vUv-.5)*vec2(4.8,3.3);
  float t=uTime*.018;
  vec2 q=vec2(fbm(p*1.2+t),fbm(p*1.4+vec2(4.2,-t)));
  float f=fbm(p*2.1+q*2.8);
  float ridge=pow(1.-abs(f*2.-1.),3.);
  float edge=min(min(vUv.x,vUv.y),min(1.-vUv.x,1.-vUv.y));
  float mask=exp(-dot(p,p)*.42)*smoothstep(0.,.18,edge);
  float clouds=smoothstep(.26,.75,f)*mask;
  float lane=smoothstep(.36,.57,fbm(p*1.6-q*1.8));
  vec3 cyan=vec3(.045,.27,.32), rose=vec3(.38,.12,.22), gold=vec3(.36,.22,.12);
  vec3 color=mix(cyan,rose,smoothstep(-.9,.9,p.y+q.y-.5));
  color=mix(color,gold,smoothstep(.6,1.6,p.x+q.x));
  color*=clouds*ridge*(.25+lane*1.4)*1.8;
  float strands=pow(max(0.,1.-abs(f-.48)*14.),4.);
  color+=vec3(.15,.26,.31)*strands*mask*.08;
  gl_FragColor=vec4(color*uWeights.z,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const horizonVertex = /* glsl */`
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vNormal = normalMatrix * normal;
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const horizonFragment = /* glsl */`
uniform vec3 uWeights;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  // Coverage fade also fades depth during scene morphs. A partially transparent
  // depth-writing sphere would otherwise cut an abrupt hole in the other scenes.
  float coverage=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
  if(coverage>=uWeights.y)discard;
  float facing=max(0.,dot(normalize(vNormal),normalize(vView)));
  float ring=exp(-pow((facing-.095)*24.,2.))*.9;
  gl_FragColor=vec4(vec3(.0003,.0002,.00015)+vec3(1.,.73,.43)*ring,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const rimFragment = /* glsl */`
uniform vec3 uWeights;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float facing=max(0.,dot(normalize(vNormal),normalize(vView)));
  float glow=pow(1.-facing,5.)*.16;
  gl_FragColor=vec4(vec3(1.,.65,.32)*glow*uWeights.y,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const lensFragment = /* glsl */`
uniform float uTime;
uniform float uDiskView;
uniform vec3 uWeights;
varying vec2 vUv;
${noise}
void main() {
  vec2 p=(vUv-.5)*4.;
  // Fade away face-on and mirror the brighter far-side arc below the disk when
  // viewed from underneath. This is an artistic lens image, not ray tracing.
  float inclination=1.-smoothstep(.15,.85,abs(uDiskView));
  float r=length(p), a=atan(p.y,p.x);
  float band=exp(-pow((r-1.19)*15.,2.));
  float above=smoothstep(-.12,.12,uDiskView);
  float upper=smoothstep(.03,.7,p.y), lower=smoothstep(.03,.7,-p.y);
  float farArc=mix(lower,upper,above);
  float secondary=mix(upper,lower,above)*.18;
  float grain=fbm(vec2(a*5.-uTime*.12,r*22.));
  float lanes=.65+.35*sin(r*160.+grain*4.);
  vec3 color=vec3(1.,.62,.27)*band*(farArc+secondary)*lanes*(.3+grain)*.75;
  gl_FragColor=vec4(color*inclination*uWeights.y,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
