const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const slugify=value=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const userEmail=request=>request.headers.get('Cf-Access-Authenticated-User-Email')||'';
const isAdmin=(request,env)=>userEmail(request).toLowerCase()===String(env.ADMIN_EMAIL||'').toLowerCase();
async function body(request){try{return await request.json()}catch{return {}}}
async function list(db,table,publicOnly=false){const where=publicOnly?" WHERE status='published'":'';return (await db.prepare(`SELECT * FROM ${table}${where} ORDER BY created_at DESC`).all()).results}
export async function onRequest({request,env,params}){
  if(!env.DB)return json({error:'Database binding is not configured.'},503);
  const parts=(params.path||[]);let [resource,idPart,adminId]=parts;
  const method=request.method;
  if(method==='GET'&&resource==='properties'&&!idPart)return json(await list(env.DB,'properties',true));
  if(method==='GET'&&resource==='posts'&&!idPart)return json(await list(env.DB,'posts',true));
  if(method==='POST'&&resource==='enquiries'){
    const v=await body(request);if(!v.name||!v.phone)return json({error:'Name and phone are required.'},400);
    await env.DB.prepare('INSERT INTO enquiries(name,phone,email,preferred_date,preferred_time,message) VALUES(?,?,?,?,?,?)').bind(v.name,v.phone,v.email||'',v.date||'',v.time||'',v.message||'').run();
    return json({ok:true},201);
  }
  if(resource!=='admin'||!isAdmin(request,env))return json({error:'Admin authentication required.'},401);
  resource=idPart;idPart=adminId;
  if(method==='GET'&&['properties','posts','enquiries'].includes(resource)&&!idPart)return json(await list(env.DB,resource));
  if(method==='POST'&&['properties','posts'].includes(resource)){
    const v=await body(request),slug=slugify(v.slug||v.title||'');if(!v.title||!slug)return json({error:'Title is required.'},400);
    if(resource==='properties')await env.DB.prepare('INSERT INTO properties(title,slug,purpose,property_type,location,price,description,image_url,status,featured) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(v.title,slug,v.purpose||'sale',v.property_type||'House',v.location||'',v.price||'',v.description||'',v.image_url||'',v.status||'draft',v.featured?1:0).run();
    else await env.DB.prepare('INSERT INTO posts(title,slug,category,excerpt,content,image_url,status,published_at) VALUES(?,?,?,?,?,?,?,?)').bind(v.title,slug,v.category||'Property insight',v.excerpt||'',v.content||'',v.image_url||'',v.status||'draft',v.status==='published'?new Date().toISOString():null).run();
    return json({ok:true},201);
  }
  if(method==='PATCH'&&['properties','posts','enquiries'].includes(resource)&&idPart){
    const v=await body(request),id=Number(idPart);if(!id)return json({error:'Invalid id.'},400);
    if(resource==='enquiries')await env.DB.prepare('UPDATE enquiries SET status=? WHERE id=?').bind(v.status||'new',id).run();
    else if(resource==='properties')await env.DB.prepare('UPDATE properties SET title=?,purpose=?,property_type=?,location=?,price=?,description=?,image_url=?,status=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(v.title,v.purpose,v.property_type,v.location,v.price||'',v.description,v.image_url||'',v.status,v.featured?1:0,id).run();
    else await env.DB.prepare("UPDATE posts SET title=?,category=?,excerpt=?,content=?,image_url=?,status=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE published_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(v.title,v.category,v.excerpt,v.content,v.image_url||'',v.status,v.status,id).run();
    return json({ok:true});
  }
  if(method==='DELETE'&&['properties','posts'].includes(resource)&&idPart){await env.DB.prepare(`DELETE FROM ${resource} WHERE id=?`).bind(Number(idPart)).run();return json({ok:true});}
  if(method==='POST'&&resource==='upload'){
    if(!env.MEDIA)return json({error:'Media bucket is not configured.'},503);
    const form=await request.formData(),file=form.get('file');if(!file||typeof file==='string')return json({error:'Choose an image.'},400);
    const key=`uploads/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;await env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type}});return json({url:`/media/${key}`},201);
  }
  return json({error:'Not found.'},404);
}
