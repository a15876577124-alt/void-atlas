import { test, expect } from '@playwright/test';

test('scene changes reuse GPU resources and renderer retirement releases them', async ({page}) => {
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const names=['Buffer','Texture','Program','Shader','Framebuffer','Renderbuffer','VertexArray'];
    window.glResources={};window.resourceOwners=new WeakMap();
    for(const kind of names){
      const live=new Set();window.glResources[kind]=live;
      const create=WebGL2RenderingContext.prototype['create'+kind],del=WebGL2RenderingContext.prototype['delete'+kind];
      WebGL2RenderingContext.prototype['create'+kind]=function(...args){const item=create.apply(this,args);if(item){live.add(item);window.resourceOwners.set(item,this);}return item};
      WebGL2RenderingContext.prototype['delete'+kind]=function(item){live.delete(item);return del.call(this,item)};
    }
    window.drawCount=0;
    for(const key of ['drawArrays','drawElements']){
      const draw=WebGL2RenderingContext.prototype[key];
      WebGL2RenderingContext.prototype[key]=function(...args){window.drawCount++;return draw.apply(this,args)};
    }
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-renderer','webgl');
  await page.locator('#quality').selectOption('low');
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const resources=()=>page.evaluate(()=>Object.fromEntries(Object.entries(window.glResources).map(([k,v])=>[k,[...v].filter(item=>{const gl=window.resourceOwners.get(item);return !gl.isContextLost()&&gl['is'+k](item)}).length])));
  for(let i=0;i<3;i++){await page.locator(`[data-scene="${i}"]`).click();await settle();}
  const initial=await resources();
  for(let i=0;i<45;i++){await page.locator(`[data-scene="${i%3}"]`).click();await settle();}
  expect(await resources()).toEqual(initial);
  const draws=await page.evaluate(()=>window.drawCount);await page.waitForTimeout(400);
  expect(await page.evaluate(()=>window.drawCount)).toBe(draws);
  await page.locator('#about-open').click();await page.locator('#lightweight').click();
  await expect(page.locator('body')).toHaveAttribute('data-renderer','canvas');
  // forceContextLoss releases default textures/FBOs without individual delete calls.
  // Inspect actual resource validity after the asynchronous loss, not stale JS handles.
  await expect.poll(async()=>Object.values(await resources()).every(n=>n===0)).toBe(true);
  for(let i=0;i<3;i++){
    await page.locator('#retry').click();await expect(page.locator('body')).toHaveAttribute('data-renderer','webgl');
    await page.locator('#about-open').click();await page.locator('#lightweight').click();
    await expect(page.locator('body')).toHaveAttribute('data-renderer','canvas');
    await expect.poll(async()=>Object.values(await resources()).every(n=>n===0)).toBe(true);
  }
  expect(errors).toEqual([]);
});
