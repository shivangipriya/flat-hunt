import {useEffect,useRef} from 'react';
import {STORY_CLIPS,type ClipKey} from './storyClips';
function Clip({k}:{k:ClipKey}){
 const c=STORY_CLIPS[k];const v=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const el=v.current;if(!el)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){el.play().catch(()=>{});}else{el.pause();}});},{threshold:0.25});
  io.observe(el);return()=>io.disconnect();},[]);
 const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 return <figure className="fh-story-fig"><video ref={v} src={c.src} poster={c.poster} width={c.w} height={c.h} muted loop playsInline preload={reduce?'none':'metadata'} controls={reduce} aria-label={c.alt}/><figcaption>{c.cap}</figcaption></figure>;
}
export function Story(){
 return <div className="fh-app fh-story-page">
  <header className="fh-header"><a className="fh-wordmark" href="#"><span>⌂</span>flat hunt<span className="fh-dot">.</span></a><a className="fh-text" href="#">← Back to the notebook</a></header>
  <article className="fh-story">
   <p className="fh-eyebrow">THE STORY BEHIND IT</p>
   <h1>Everyone Remembers the Balcony. Nobody Remembers the Deposit.</h1>
   <p>I keep hearing from friends who are struggling with flat hunting. It is hard enough on its own. Then there is a second problem that gets less attention: even after you have seen a flat, it is surprisingly difficult to remember what you actually learned there.</p>
   <p>Here is how a visit tends to go. You walk in. There is a balcony. Stand on it for ninety seconds and you will forgive almost anything: the damp patch, the lock-in clause, the owner saying “we can adjust.” You leave. On the street you remember the balcony. The deposit terms have quietly left the building.</p>
   <Clip k="sandwich"/>
   <p>By the third flat, the facts start to mix. Which one had water only in the morning? Which “two months” meant two months, and which meant two months plus a month to be named later? The camera roll has eleven photos of the same bedroom. The chat called “Broker 2 (new)” is not helping.</p>
   <Clip k="math"/>
   <p>I work in testing, and I know this pattern from work. When something matters, you do not rely on memory. You write down what you checked, what you found, and what is still open. A flat costs a month’s rent or more up front, and most of us decide on it by feel and a few blurry photos.</p>
   <p>So I built the notebook I wanted people to have. It is not another listings site. Those are very good at showing you a bright photo, taken by someone who would like you to say yes. I wanted a plain notebook with the dull questions already printed in it, so you are not inventing them in a stranger’s stairwell.</p>
   <p>I gave it a few rules, mostly about what it refuses to do.</p>
   <p>It says “Not added” when you leave a number blank. Never 0. A deposit of zero and a deposit nobody mentioned are two different flats, and I did not want a tool that blurs them politely.</p>
   <p>It does not score your flats. A score needs weights, and the weights would be mine. If you hate noise and do not care about balconies, a number from me is a guess with decimals.</p>
   <p>It keeps the checklist to twenty points, so you can get through it standing in someone else’s kitchen.</p>
   <p>Your list is saved in your own browser so a phone call or a reload does not wipe it. Flat Hunt does not upload your notes automatically, and it does not need to know where you live. If you choose Share or Copy, that text goes where you send it. “Erase saved copy” deletes what the browser has saved and turns saving off. The list stays on the page until you close or refresh it.</p>
   <p>The last section is for before you pay a token amount: ask to see the draft agreement, get a written receipt, get the refund terms in writing, and video call from inside the flat if you cannot be there. Asking for things in writing is not rude. It is also the quickest way to learn how an owner behaves when asked for things in writing.</p>
   <p>The rules are small. The idea under them is smaller: write it down before you walk out.</p>
   <p>So go and stand on the balcony. Enjoy it, you are allowed. Just take the notebook in with you, and write the deposit down first. The balcony will still be there tomorrow. The deposit terms, if you do not write them down, will not.</p>
   <Clip k="typing"/>
   <p>Flat Hunt is an early version, and it gets better with real flat hunts. Try it on the last flat you saw. If a check is missing, open an issue on <a href="https://github.com/shivangipriya/flat-hunt/issues" target="_blank" rel="noreferrer">GitHub</a> and tell me which one. The <a href="https://github.com/shivangipriya/flat-hunt" target="_blank" rel="noreferrer">source</a> is there too.</p>
   <p>Balcony: lovely. Deposit: Not added. Yet.</p>
   <p className="fh-story-sign">Shivangi :)</p>
  </article>
  <footer className="fh-footer fh-story-footer"><div><strong>flat hunt.</strong></div><p>Made with care by <a href="https://www.linkedin.com/in/shivangii-priyaa" target="_blank" rel="noreferrer">Shivangi Priya</a> · <a href="https://github.com/shivangipriya/flat-hunt" target="_blank" rel="noreferrer">Source on GitHub</a></p></footer>
 </div>;
}
