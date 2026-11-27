import {STORY_IMAGES} from './storyImages';
const DIM={wall:[735,742],highlight:[736,688],brick:[675,538]} as const;
const img=(k:'wall'|'highlight'|'brick',alt:string,cap:string)=>STORY_IMAGES[k]?<figure className="fh-story-fig"><img src={STORY_IMAGES[k]} alt={alt} width={DIM[k][0]} height={DIM[k][1]} decoding="async"/><figcaption>{cap}</figcaption></figure>:null;
export function Story(){
 return <div className="fh-app fh-story-page">
  <header className="fh-header"><a className="fh-wordmark" href="#"><span>⌂</span>flat hunt<span className="fh-dot">.</span></a><a className="fh-text" href="#">← Back to the notebook</a></header>
  <article className="fh-story">
   <p className="fh-eyebrow">THE STORY BEHIND IT</p>
   <h1>I built Flat Hunt because a nice balcony wipes your memory</h1>
   <p className="fh-story-sub">A notebook for the part of flat hunting where everything seems fine until you check</p>
   <p>A nice balcony is a powerful thing. Stand on one for ninety seconds and you will forgive almost anything: the damp patch, the lock-in clause, the owner saying “we can adjust.” By the time you are back on the street, you remember the balcony. The deposit terms have quietly left the building.</p>
   {img('wall','A person in front of a wall of notes connected with red string','Comparing flats from memory.')}
   <p>That is why I built Flat Hunt. A flat visit is the one stage of renting where the facts that matter are small, said once, and said by someone who is also trying to be pleasant. Water timing. Power backup. Whether “two months” means two months. None of it is hard to understand. All of it is gone by flat number three. The usual tools for remembering are a camera roll full of identical bedrooms and a chat called “Broker 2 (new)”.</p>
   <p>So I wanted somewhere to put it. Not another listings site. Those are very good at showing you a bright photo, taken by someone who would like you to say yes. I wanted a notebook with the dull questions already printed in it, so you are not inventing them in a stranger’s stairwell.</p>
   {img('highlight','A page where every line is highlighted','Why the checklist stops at twenty.')}
   <p>I gave it a few rules, mostly about what it should refuse to do.</p>
   <p>It says “Not added” when you leave a number blank. Never 0. A deposit of zero and a deposit nobody mentioned are two different flats, and I did not want a tool that blurs them politely.</p>
   <p>It does not score your flats. A score needs weights, and the weights would be mine. If you hate noise and do not care about balconies, a number from me is just a guess with decimals.</p>
   <p>It keeps the checklist to twenty points in five groups, so you can finish it while standing in someone else’s kitchen.</p>
   <p>And your notes stay in your browser. They are not sent anywhere, and Flat Hunt does not need to know where you live. The “remember” box only decides whether your browser keeps the notes after you close the tab. Leave it unticked and they disappear.</p>
   <p>The last section is for before you pay a token: see the draft agreement, get a written receipt, ask for the refund terms in writing, video call from inside the flat if you are not there.</p>
   {img('brick','A man talking to a brick wall','Asking for the refund terms in writing.')}
   <p>Asking is not rude. It is also a fast way to find out how an owner behaves when asked for things in writing.</p>
   <p>That is the whole story. I did not set out to build a clever app. I wanted a place to put what a balcony makes you forget.</p>
   <div className="fh-story-try"><p>Try it on the last flat you saw: <a href="#">flat-hunt.pages.dev</a></p><p>If a check is missing, tell me which one. The source is on <a href="https://github.com/shivangipriya/flat-hunt" target="_blank" rel="noreferrer">GitHub</a>.</p></div>
  </article>
  <footer className="fh-footer fh-story-footer"><div><strong>flat hunt.</strong></div><p>Made with care by <a href="https://www.linkedin.com/in/shivangii-priyaa" target="_blank" rel="noreferrer">Shivangi Priya</a> · <a href="https://github.com/shivangipriya/flat-hunt" target="_blank" rel="noreferrer">Source on GitHub</a></p></footer>
 </div>;
}
