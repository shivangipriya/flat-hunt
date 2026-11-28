// Supplied by the site owner. Reuse rights for these clips were not independently verified.
// Muted looping H.264 re-encodes of the supplied clips (same pictures, smaller files), with a still poster each.
export const STORY_CLIPS={
 sandwich:{src:'/story/1-sandwich.mp4',poster:'/story/2-sandwich-poster.jpg',w:362,h:362,cap:'Ninety seconds on the balcony.',alt:'A man in a kitchen eating a sandwich with obvious delight'},
 math:{src:'/story/3-math.mp4',poster:'/story/4-math-poster.jpg',w:360,h:230,cap:'Two months. Plus a month to be named later.',alt:'A woman looking confused while maths formulas appear over her face'},
 typing:{src:'/story/5-typing.mp4',poster:'/story/6-typing-poster.jpg',w:534,h:300,cap:'Writing the deposit down. Immediately.',alt:'A man typing eagerly at a computer'}
} as const;
export type ClipKey=keyof typeof STORY_CLIPS;
