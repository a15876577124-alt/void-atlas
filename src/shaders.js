export const particleVertex = /* glsl */`
attribute vec3 aHorizon;
attribute vec3 aNebula;
attribute vec4 aSeed;
uniform float uTime;
uniform float uDpr;
uniform float uScale;
uniform vec3 uWeights;
precision highp sampler3D;
uniform sampler3D uCloudVolume;
float cloudDensity(vec3 world) {
  vec3 uv=world/vec3(5.8,4.2,3.6)*.5+.5;
  uv+=sin(uv.yzx*4.+uTime*.025)*.008;
  return texture(uCloudVolume,uv).r;
}

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
  // Integrate only the cloud in FRONT of each star. Keep at least 45% of its light.
  if(uWeights.z>.001) {
    vec3 ray=normalize(n-cameraPosition), scale=vec3(5.8,4.2,3.6);
    vec3 ro=cameraPosition/scale, rd=ray/scale;
    float aa=dot(rd,rd),bb=dot(ro,rd),cc=dot(ro,ro)-1.,disc=bb*bb-aa*cc;
    if(disc>0.) {
      float entry=max(0.,(-bb-sqrt(disc))/aa);
      float end=min(length(n-cameraPosition),(-bb+sqrt(disc))/aa);
      float ds=max(0.,end-entry)/8., opticalDepth=0.;
      for(int i=0;i<8;i++) opticalDepth+=cloudDensity(cameraPosition+ray*(entry+(float(i)+.5)*ds))*ds;
      vAlpha*=mix(1.,max(.45,exp(-opticalDepth*.7)),uWeights.z);
    }
  }
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
  // Plane UV Y maps to world -Z. Match the stars' handedness and orbital speed.
  float ga=-a+uTime*.028/(.7+r*.18);
  vec2 world=vec2(cos(ga),sin(ga))*r;
  float coarse=fbm(world*.85+vec2(8.,5.));
  float detail=fbm(world*3.2);
  float phase=.6+2.65*log(1.+r*.85);
  float bend=(coarse-.5)*.38;
  float d0=atan(sin(ga-phase-bend),cos(ga-phase-bend));
  float d1=atan(sin(ga-phase-3.45-.16*sin(r*1.4)-bend),cos(ga-phase-3.45-.16*sin(r*1.4)-bend));
  float width=.16+.12*coarse;
  float arms=exp(-d0*d0/(width*width))+.68*exp(-d1*d1/(width*width*1.6));
  float outer=1.-smoothstep(4.2,5.5,r);
  float spur=atan(sin(ga-phase-.5-.22*(r-3.)),cos(ga-phase-.5-.22*(r-3.)));
  float branch=.48*exp(-spur*spur/.04)*smoothstep(2.,3.,r)*(1.-smoothstep(4.3,5.3,r));
  float dust=(arms+branch)*exp(-r*.38)*outer*smoothstep(.28,.64,detail)*.70;
  float core=exp(-r*r*2.8)*.6;
  vec3 galaxy=mix(vec3(.14,.30,.43),vec3(.68,.44,.23),exp(-r*.9))*dust+vec3(1.,.76,.43)*core;
  galaxy+=vec3(.32,.09,.12)*smoothstep(.58,.72,detail)*arms*outer*.12;
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

export const cloudVertex = /* glsl */`
varying vec3 vWorldPosition;
void main() {
  vWorldPosition=(modelMatrix*vec4(position,1.)).xyz;
  gl_Position=projectionMatrix*viewMatrix*vec4(vWorldPosition,1.);
}
`;

export const cloudFragment = /* glsl */`
uniform float uTime;
uniform vec3 uWeights;
uniform int uCloudSteps;
precision highp sampler3D;
uniform sampler3D uCloudVolume;
float cloudDensity(vec3 world) {
  vec3 uv=world/vec3(5.8,4.2,3.6)*.5+.5;
  uv+=sin(uv.yzx*4.+uTime*.025)*.008;
  return texture(uCloudVolume,uv).r;
}

varying vec3 vWorldPosition;
void main() {
  vec3 ray=normalize(vWorldPosition-cameraPosition);
  vec3 scale=vec3(5.8,4.2,3.6), ro=cameraPosition/scale, rd=ray/scale;
  float a=dot(rd,rd),b=dot(ro,rd),c=dot(ro,ro)-1.,disc=b*b-a*c;
  if(disc<=0.)discard;
  float enter=max(0.,(-b-sqrt(disc))/a),exit=(-b+sqrt(disc))/a;
  float stepSize=(exit-enter)/float(uCloudSteps);
  vec3 color=vec3(0.);float transmission=1.;
  for(int i=0;i<72;i++) {
    if(i>=uCloudSteps)break;
    vec3 world=cameraPosition+ray*(enter+(float(i)+.5)*stepSize);
    float density=cloudDensity(world);
    float opacity=1.-exp(-density*stepSize*1.3);
    vec3 tint=mix(vec3(.045,.27,.32),vec3(.38,.12,.22),smoothstep(-1.7,2.,world.y));
    tint=mix(tint,vec3(.36,.22,.12),smoothstep(1.5,4.2,world.x));
    color+=transmission*opacity*tint*1.8;
    transmission*=1.-opacity;
  }
  gl_FragColor=vec4(color*uWeights.z,1.);
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
