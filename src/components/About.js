import { useEffect, useState } from 'react'
import BlockContent from '@sanity/block-content-to-react'
import { client } from '../sanity'

import css from './About.module.scss'

const query = '*[_type == "about"]'

export default function About(props) {
  const [aboutText, setAboutText] = useState([])

  useEffect(() => {
    async function fetchAboutText() {
      try {
        const response = await client.fetch(query)
        setAboutText(response[0].aboutText)
      } catch (e) {
        console.error(e)
      }
    }
    fetchAboutText()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* <div className={`${css.bg} ${css.revealBg}`} /> */}
      <div className={`${css.container} ${props.open && css.revealContainer}`}>
        <div className={css.textContainer}>
          <h1>Moving Forward, It Saw Moments of Beauty</h1>
          <BlockContent blocks={aboutText} />
        </div>
      </div>
    </>
  )
}
