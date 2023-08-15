import invariant from "tiny-invariant"

invariant(typeof process.env.LANDING_PAGE === "string", "Page not found")

const HTML_STR = `<iframe width="100%" height="100%" src="${process.env.LANDING_PAGE}" allow="fullscreen"></iframe>`

export default function Home() {
  const createMarkup = (value: string) => {
    return {
      __html: value,
    }
  }

  return (
    <>
      <div
        className="w-full h-full h-screen"
        dangerouslySetInnerHTML={createMarkup(HTML_STR)}
      />
    </>
  )
}
