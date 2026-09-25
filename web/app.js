const $=id=>document.getElementById(id);
let categories=[],current=[],selected=-1,activeCategory='',activeSubcategory='';
const viewer=$('viewer');

function el(tag,className,text){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

function photo(item){
  const wrap=el('div','photo');
  const img=el('img');
  img.src=item.src;
  img.alt=item.name;
  img.loading='lazy';
  img.decoding='async';
  wrap.append(img);
  return wrap;
}

function route(category,subcategory=''){
  return '#'+[category,subcategory].filter(Boolean).map(encodeURIComponent).join('/');
}

function groups(category){
  return [...new Set(category.items.map(item=>item.subcategory).filter(Boolean))];
}

function readRoute(){
  const parts=location.hash.slice(1).split('/');
  try{return parts.map(decodeURIComponent);}catch{return ['',''];}
}

function categoryCard(name,items,href){
  const card=el('a','card category-card');
  card.href=href;
  if(items.length){
    const preview=photo(items[0]);
    preview.classList.add('category-photo');
    card.append(preview);
  }
  const title=el('span','card-title',name);
  title.append(el('b',null,'↗'));
  card.append(title,el('span','card-meta',`${items.length} รูปสินค้า`));
  return card;
}

function render(){
  const [name='',requestedSubcategory='']=readRoute();
  const category=categories.find(item=>item.name===name);
  const subcategories=category?groups(category):[];
  activeCategory=category?.name||'';
  activeSubcategory=subcategories.includes(requestedSubcategory)?requestedSubcategory:'';

  document.querySelectorAll('nav a').forEach(link=>{
    const exact=link.dataset.category===activeCategory&&(link.dataset.subcategory||'')===activeSubcategory;
    link.setAttribute('aria-current',exact?'page':'false');
    link.classList.toggle('active-parent',link.dataset.category===activeCategory&&!link.dataset.subcategory&&!!activeSubcategory);
  });

  $('heading').textContent=category?(activeSubcategory?`${category.name} · ${activeSubcategory}`:category.name):'แคตตาล็อกสินค้า';
  current=category?(activeSubcategory?category.items.filter(item=>item.subcategory===activeSubcategory):category.items):[];
  $('count').textContent=category?`${current.length.toLocaleString('th')} รูปสินค้า`:`${categories.length} หมวด · ${categories.reduce((total,item)=>total+item.items.length,0).toLocaleString('th')} รูปสินค้า`;
  $('content').replaceChildren();
  const grid=el('div','grid');
  $('content').append(grid);

  if(category){
    if(!current.length)grid.append(el('p','empty','ยังไม่มีสินค้าในหมวดนี้'));
    current.forEach((item,index)=>{
      const card=el('button','card');
      card.type='button';
      card.append(photo(item),el('span','card-title',item.name));
      card.setAttribute('aria-label',`ดูรูป ${item.name}`);
      card.addEventListener('click',()=>openImage(index));
      grid.append(card);
    });
    return;
  }

  for(const item of categories)grid.append(categoryCard(item.name,item.items,route(item.name)));
}

function openImage(index){
  selected=index;
  const item=current[index];
  $('original-toggle').hidden=!item.originalSrc;
  $('original-toggle').textContent='ดูภาพต้นฉบับ';
  $('original-toggle').dataset.original='false';
  $('full-image').src=item.src;
  $('full-image').alt=item.name;
  $('image-name').textContent=item.name;
  $('image-category').textContent=[activeCategory,activeSubcategory].filter(Boolean).join(' · ');
  $('position').textContent=`${index+1} / ${current.length}`;
  $('previous').disabled=index===0;
  $('next').disabled=index===current.length-1;
  if(!viewer.open)viewer.showModal();
}

$('close').onclick=()=>viewer.close();
$('previous').onclick=()=>selected>0&&openImage(selected-1);
$('next').onclick=()=>selected<current.length-1&&openImage(selected+1);
viewer.addEventListener('click',event=>{
  if(event.target===viewer){
    const bounds=viewer.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)viewer.close();
  }
});
document.addEventListener('keydown',event=>{
  if(!viewer.open)return;
  if(event.key==='ArrowLeft'&&selected>0)openImage(selected-1);
  if(event.key==='ArrowRight'&&selected<current.length-1)openImage(selected+1);
});
window.addEventListener('hashchange',()=>{
  viewer.close();
  render();
  window.scrollTo(0,0);
});

async function init(){
  try{
    const response=await fetch('catalog.json');
    if(!response.ok)throw Error('Catalog unavailable');
    categories=await response.json();
    $('category-count').textContent=categories.length;

    const all=el('a',null,'ทั้งหมด');
    all.href='#';
    all.dataset.category='';
    $('categories').append(all);

    for(const category of categories){
      const container=el('div','nav-group');
      const subcategories=groups(category);
      const categoryLink=el('a','category-link',category.name);
      categoryLink.href=route(category.name);
      categoryLink.dataset.category=category.name;
      categoryLink.append(el('span',null,String(category.items.length)));
      container.append(categoryLink);

      if(subcategories.length){
        const subnav=el('div','subnav');
        subnav.hidden=true;
        categoryLink.setAttribute('aria-expanded','false');
        categoryLink.addEventListener('click',()=>{
          const expanded=categoryLink.getAttribute('aria-expanded')==='true';
          categoryLink.setAttribute('aria-expanded',String(!expanded));
          subnav.hidden=expanded;
        });
        for(const subcategory of subcategories){
          const count=category.items.filter(item=>item.subcategory===subcategory).length;
          const link=el('a',null,subcategory);
          link.href=route(category.name,subcategory);
          link.dataset.category=category.name;
          link.dataset.subcategory=subcategory;
          link.append(el('span',null,String(count)));
          subnav.append(link);
        }
        container.append(subnav);
      }
      $('categories').append(container);
    }
    render();
  }catch{
    $('count').textContent='';
    const message=el('p','empty','โหลดรายการสินค้าไม่สำเร็จ กรุณาลองใหม่');
    const retry=el('button',null,'ลองใหม่');
    retry.onclick=()=>location.reload();
    $('content').replaceChildren(message,retry);
  }
}

$('original-toggle').onclick=()=>{
  const item=current[selected];
  const show=$('original-toggle').dataset.original!=='true';
  $('full-image').src=show?item.originalSrc:item.src;
  $('original-toggle').dataset.original=String(show);
  $('original-toggle').textContent=show?'ดูภาพออกแบบใหม่':'ดูภาพต้นฉบับ';
};

init();
