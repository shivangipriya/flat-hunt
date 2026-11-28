import React,{useEffect,useState,lazy,Suspense} from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import {App} from './App';
const Story=lazy(()=>import('./Story').then(m=>({default:m.Story})));
import './style.css';
function Root(){
 const [story,setStory]=useState(location.hash==='#story');
 useEffect(()=>{const f=()=>{setStory(location.hash==='#story');window.scrollTo(0,0);};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f);},[]);
 useEffect(()=>{document.title=story?'Everyone Remembers the Balcony. Nobody Remembers the Deposit.':'Flat Hunt: free flat visit checklist and comparison notebook for India';},[story]);
 return story?<Suspense fallback={<div className="fh-app" style={{padding:24}}>Loading the story...</div>}><Story/></Suspense>:<App/>;
}
const tree=<React.StrictMode><Root/></React.StrictMode>;
const rootEl=document.getElementById('root')!;
if(rootEl.hasChildNodes()&&location.hash!=='#story')hydrateRoot(rootEl,tree);
else{rootEl.textContent='';createRoot(rootEl).render(tree);}
