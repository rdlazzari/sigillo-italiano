const form=document.querySelector('.guide-filters');
if(form){
 const city=document.querySelector('#city'),kind=document.querySelector('#kind');
 const cards=[...document.querySelectorAll('.address-card')];
 function filter(){let count=0;for(const card of cards){const show=(!city.value||card.dataset.city===city.value)&&(!kind.value||card.dataset.kind===kind.value);card.hidden=!show;if(show)count++}document.querySelector('.guide-total').textContent=count+(count===1?' endereço':' endereços');document.querySelector('#guide-empty').hidden=count!==0;}
 form.addEventListener('change',filter);
 form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('reset',()=>{requestAnimationFrame(filter)});
}
