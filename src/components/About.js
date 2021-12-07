import css from './About.module.scss'

export default function About(props) {
  return (
    <>
      {/* <div className={`${css.bg} ${css.revealBg}`} /> */}
      <div className={`${css.container} ${props.open && css.revealContainer}`}>
        <div className={css.textContainer}>
          <h1>Moving Forward, It Saw Moments of Beauty</h1>
          <p>
            {' '}
            "Moving Forward, It Saw Moments of Beauty" (2017-ongoing) is a four
            inch continuous watercolour painting on paper which at present spans
            114 feet. It comes into existence in response to a life, unfolding
            in parallel with the experience of being, and is an attempt to
            abstract and condense this reality into the clear form of a single
            object - a painting.{' '}
          </p>
        </div>
      </div>
    </>
  )
}
