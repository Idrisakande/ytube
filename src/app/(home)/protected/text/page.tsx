import { FC } from 'react'

type pageProps = {
  id: string
}

const page: FC<pageProps> = ({id}) => {
  return <div>{id}page</div>
}

export default page