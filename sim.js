const E = require('./engine.js'); const D = require('./data.js');
function run(strategy, trials){
  const ranks = {}; D.CHARACTERS.forEach(c=>ranks[c.name]=[]);
  const last = {}; D.CHARACTERS.forEach(c=>last[c.name]=0);
  for(let t=0;t<trials;t++){
    const scs = E.drawScenarios(10);
    const choices = scs.map(sc => strategy==='first'?0: strategy==='second'?1: strategy==='third'?2: Math.floor(Math.random()*sc.options.length));
    const res = E.simulateAll(scs, choices, 1).sort((a,b)=>b.score.total-a.score.total);
    res.forEach((r,i)=>ranks[r.ch.name].push(i+1));
    last[res[res.length-1].ch.name]++;
  }
  console.log('--- strategy', strategy);
  Object.entries(ranks).map(([n,a])=>[n,(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1)]).sort((a,b)=>a[1]-b[1]).forEach(([n,m])=>console.log(n.padEnd(5), '평균순위', m, '꼴찌', last[n]));
}
['first','second','third','random'].forEach(s=>run(s,300));
