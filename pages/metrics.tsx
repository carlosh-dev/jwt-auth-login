import { Fragment, useContext, useEffect } from "react"
import CanSee from "../components/CanSee"
import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
  return (
    <Fragment>
      <h1>Metrics</h1>
    </Fragment>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get('/me');
  // console.log(response);

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})