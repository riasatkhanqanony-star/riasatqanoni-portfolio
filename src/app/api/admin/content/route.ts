import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensurePortfolioTables, sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const allowed = new Set(['experience','education','certifications','technologies','strengths','languages','references','socials']);

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    await ensurePortfolioTables();
    const b = await req.json();
    const q = sql();
    if (b.type === 'profile') {
      const p=b.data||{};
      await q`UPDATE portfolio_profile SET name=${String(p.name??'')}, role=${String(p.role??'')}, summary=${String(p.summary??'')}, email=${String(p.email??'')}, phone=${String(p.phone??'')}, phone_2=${String(p.phone_2??'')}, location=${String(p.location??'')}, availability=${p.availability !== false}, resume_url=${String(p.resume_url??'')}, profile_image=${String(p.profile_image??'')}, updated_at=now() WHERE id=1`;
    } else if (allowed.has(b.type)) {
      const d=b.data||{}, id=Number(b.id||0);
      if(b.type==='experience') id ? await q`UPDATE experience SET role=${d.role||''},company=${d.company||''},location=${d.location||''},period=${d.period||''},description=${d.description||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO experience(role,company,location,period,description,sort_order) VALUES(${d.role||''},${d.company||''},${d.location||''},${d.period||''},${d.description||''},${Number(d.sort_order)||0})`;
      if(b.type==='education') id ? await q`UPDATE education SET degree=${d.degree||''},institution=${d.institution||''},period=${d.period||''},location=${d.location||''},status=${d.status||'completed'},details=${d.details||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO education(degree,institution,period,location,status,details,sort_order) VALUES(${d.degree||''},${d.institution||''},${d.period||''},${d.location||''},${d.status||'completed'},${d.details||''},${Number(d.sort_order)||0})`;
      if(b.type==='certifications') id ? await q`UPDATE certifications SET title=${d.title||''},issuer=${d.issuer||''},period=${d.period||''},description=${d.description||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO certifications(title,issuer,period,description,sort_order) VALUES(${d.title||''},${d.issuer||''},${d.period||''},${d.description||''},${Number(d.sort_order)||0})`;
      if(b.type==='technologies') id ? await q`UPDATE technologies SET category=${d.category||''},name=${d.name||''},hover_color=${d.hover_color||'#777777'},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO technologies(category,name,hover_color,sort_order) VALUES(${d.category||''},${d.name||''},${d.hover_color||'#777777'},${Number(d.sort_order)||0})`;
      if(b.type==='strengths') id ? await q`UPDATE strengths SET title=${d.title||''},description=${d.description||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO strengths(title,description,sort_order) VALUES(${d.title||''},${d.description||''},${Number(d.sort_order)||0})`;
      if(b.type==='languages') id ? await q`UPDATE languages SET name=${d.name||''},level=${d.level||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO languages(name,level,sort_order) VALUES(${d.name||''},${d.level||''},${Number(d.sort_order)||0})`;
      if(b.type==='references') id ? await q`UPDATE professional_references SET name=${d.name||''},role=${d.role||''},company=${d.company||''},contact=${d.contact||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO professional_references(name,role,company,contact,sort_order) VALUES(${d.name||''},${d.role||''},${d.company||''},${d.contact||''},${Number(d.sort_order)||0})`;
      if(b.type==='socials') id ? await q`UPDATE social_links SET platform=${d.platform||''},url=${d.url||''},sort_order=${Number(d.sort_order)||0} WHERE id=${id}` : await q`INSERT INTO social_links(platform,url,sort_order) VALUES(${d.platform||''},${d.url||''},${Number(d.sort_order)||0})`;
    } else throw new Error('Invalid type');
    revalidatePath('/'); revalidatePath('/projects'); return NextResponse.json({ok:true});
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Save failed'},{status:400});}
}
export async function DELETE(req:Request){if(!(await isAdmin()))return NextResponse.json({error:'Unauthorized'},{status:401});const u=new URL(req.url),type=u.searchParams.get('type'),id=Number(u.searchParams.get('id'));if(!Number.isInteger(id))return NextResponse.json({error:'Invalid request'},{status:400});if(!allowed.has(type||'')||!Number.isInteger(id))return NextResponse.json({error:'Invalid request'},{status:400});try{await ensurePortfolioTables();const q=sql();switch(type){case'experience':await q`DELETE FROM experience WHERE id=${id}`;break;case'education':await q`DELETE FROM education WHERE id=${id}`;break;case'certifications':await q`DELETE FROM certifications WHERE id=${id}`;break;case'technologies':await q`DELETE FROM technologies WHERE id=${id}`;break;case'strengths':await q`DELETE FROM strengths WHERE id=${id}`;break;case'languages':await q`DELETE FROM languages WHERE id=${id}`;break;case'references':await q`DELETE FROM professional_references WHERE id=${id}`;break;case'socials':await q`DELETE FROM social_links WHERE id=${id}`;break;}revalidatePath('/');return NextResponse.json({ok:true});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Delete failed'},{status:400});}}
