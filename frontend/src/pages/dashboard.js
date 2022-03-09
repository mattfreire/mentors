import {useRouter} from 'next/router';
import React, {useContext} from "react";
import Talk from "talkjs";
import useSWR, {SWRConfig} from "swr";
import {ScaleIcon} from '@heroicons/react/outline'
import { ChatIcon } from '@heroicons/react/solid'
import {AuthContext} from "../contexts/AuthContext";
import {API_URL, TALKJS_PROJECT_ID} from "../config";
import {DashboardLayout} from "../components/DashboardLayout";
import {getProfilePicture} from "../utils/profilePic";
import {classNames} from "../utils/classNames";

class Inbox extends React.Component {
  constructor(props) {
    super(props);
    // TalkJS only works in the browser; ensure we're not trying to load TalkJS when
    // prerendering the HTML in Node.
    if (process.browser) {
      this.session = this.makeTalkSession();
    }
    this.inboxContainerRef = React.createRef();
    this.state = {
      selectedClient: null
    }
  }

  /**
   * Returns a Promise that resolves with a Talk.Session object. Loading TalkJS is asynchronous
   * because it fetches the TalkJS SDK from the TalkJS CDN after your site has loaded.
   *
   * In larger apps you'll probably want to put the Talk.Session instance in the state of a
   * component further up the hierarchy, or in some state management layer you may use. We
   * recommend just storing the Promise that resolves to the Talk.Session there, awaiting it every
   * time you need it. In practice this will still be instantaneous once TalkJS has loaded, so
   * there's no performance penalty.
   */
  async makeTalkSession() {
    const {user} = this.props
    await Talk.ready;
    const me = new Talk.User({
      id: user.id,
      name: user.first_name,
      photoUrl: getProfilePicture(user.profile_picture, user.name),
      role: "client"
    })
    return new Talk.Session({
      appId: TALKJS_PROJECT_ID,
      me
    });
  }

  /**
   * Await TalkJS initialization and then create a chatbox. We do this in componentDidMount so
   * that we're sure that the HTML is there. componentDidMount() is not called when
   * server-side-rendering so we do not need to check for `process.browser` here like we did in
   * the constructor.
   */
  async componentDidMount() {
    const session = await this.session;
    const inbox = session.createInbox();
    inbox.mount(this.inboxContainerRef.current);
    inbox.on("conversationSelected", async conversation => {
      if (conversation.others && conversation.others.length > 0) {
        const client = conversation.others[0]
        this.setState({selectedClient: client})
      } else {
        this.setState({selectedClient: null})
      }
    })
  }

  createSession = async () => {
    const session = await this.session;

    try {
      const date = new Date()
      const startTime = date.toTimeString()
      const body = {
        start_time: startTime,
        client: this.state.selectedClient.id
      }
      const apiRes = await fetch(`${API_URL}/api/sessions/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.accessToken}`,
        },
        body: JSON.stringify(body)
      });
      if (apiRes.status === 201) {
        const data = await apiRes.json();
        const conversation = session.getOrCreateConversation(
          Talk.oneOnOneId(
            this.props.user.id.toString(),
            this.state.selectedClient.id.toString()
          )
        );
        await conversation.sendMessage(`I have started a session. You can join the session on this link: ${data.session_url}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  render() {
    return (
      <main>
        <div className="">
          <div className="px-4 py-4 sm:px-0">
            <style jsx>{`
            .chat-container {
                height: 500px;
                width: 400px;
            }
            `}</style>
            <div className="chat-container" ref={this.inboxContainerRef}>loading inbox...</div>
          </div>
          {this.state.selectedClient && (
            <div className="px-4 sm:px-0">
              <button
                type="button"
                onClick={this.createSession}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start a session with {this.state.selectedClient.name}
                <ChatIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true"/>
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }
}

const statusStyles = {
  paid: 'bg-green-100 text-green-800',
  in_transit: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
}


function Dashboard() {
  const router = useRouter();
  const {user, accessToken, loading} = useContext(AuthContext)

  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }

  function displayArrivalDate(timestamp) {
    const dateObj = new Date(timestamp * 1000)
    return dateObj.toUTCString()
  }

  const {data: stripeAccountBalance} = useSWR(`${API_URL}/api/stripe-account-balance/`, fetcher)
  const {data: stripeAccountPayouts} = useSWR(`${API_URL}/api/stripe-account-payouts/`, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  return (
    <DashboardLayout>
      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-5">
        {/* Left Column */}
        <div className="col-span-3">
          {/* Left column */}
          <h2 className="text-lg leading-6 font-medium text-gray-900">Overview</h2>

          <div className="mt-2 bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ScaleIcon className="h-6 w-6 text-gray-400" aria-hidden="true"/>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Account balance</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stripeAccountBalance && stripeAccountBalance.pending.map(balance => (
                          <p key={balance.currency}>
                            {balance.currency === "eur" ? (
                              "€"
                            ) : (
                              "$"
                            )}
                            {balance.amount}
                          </p>
                        ))}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <h2
            className="mt-8 text-lg leading-6 font-medium text-gray-900">
            Payouts
          </h2>

          {/* Activity table (small breakpoint and up) */}
          <div className="flex flex-col mt-2">
            <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                <tr>
                  <th
                    className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th
                    className="hidden px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:block">
                    Status
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival Date
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {stripeAccountPayouts && stripeAccountPayouts.data.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">You haven't received any payouts yet!</span>
                    </td>
                  </tr>
                )}
                {stripeAccountPayouts && stripeAccountPayouts.data.map((transaction) => (
                  <tr key={transaction.id} className="bg-white">
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">{transaction.amount} </span>
                      {transaction.currency}
                    </td>
                    <td className="hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500 md:block">
                      <span
                        className={classNames(
                          statusStyles[transaction.status],
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
                        )}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                      <time dateTime={transaction.arrival_date}>{displayArrivalDate(transaction.arrival_date)}</time>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>

              {/* Pagination */}
              {stripeAccountPayouts && stripeAccountPayouts.data.has_more && (
                <nav
                  className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                  aria-label="Pagination"
                >
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span
                      className="font-medium">10</span> of{' '}
                      <span className="font-medium">20</span> results
                    </p>
                  </div>
                  <div className="flex-1 flex justify-between sm:justify-end">
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </a>
                    <a
                      href="#"
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </a>
                  </div>
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex">
          {/* Chat Inbox */}
          <div>
            <h2
              className="text-lg leading-6 font-medium text-gray-900">
              Chat Inbox
            </h2>
            <div className="mt-2 rounded-lg bg-white overflow-hidden shadow">
              <div className="px-4 py-3">
                <Inbox accessToken={accessToken} user={user}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


function DashboardPage({fallback}) {
  return (
    <SWRConfig value={{fallback}}>
      <Dashboard/>
    </SWRConfig>
  )
}

export default DashboardPage;

export async function getServerSideProps(context) {
  const {req} = context
  const {cookies} = req
  const API = `${API_URL}/api/mentors/me/`;
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    }).then((res) => res.json());
  }
  const data = await fetcher(API);
  return {
    props: {
      protected: true,
      fallback: {
        [API]: data
      }
    },
  }
}
