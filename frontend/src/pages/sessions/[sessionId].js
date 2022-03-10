import {useRouter} from 'next/router';
import React, {useContext, useEffect, useState} from "react";
import Link from "next/link";
import useSWR, {SWRConfig, useSWRConfig} from "swr";
import io from "socket.io-client";
import {PauseIcon, PlayIcon, StopIcon} from "@heroicons/react/solid";
import {ViewListIcon} from '@heroicons/react/outline'
import {MentorProfileHeader} from "../../components/MentorProfileHeader";
import {ClientChatbox} from "../../containers/ClientChatbox";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";
import {classNames} from "../../utils/classNames";

let socket

const callProviders = [
  {
    title: 'Google Meet',
    description: 'Create a new meeting with Google Meets.',
    icon: ViewListIcon,
    background: 'bg-yellow-500',
  },
  {
    title: 'Zoom',
    description: 'Create a new meeting with Zoom.',
    icon: ViewListIcon,
    background: 'bg-blue-500',
  },
]

function CallProviders() {
  return (
    <div>
      <ul role="list" className="mt-6 border-t border-gray-200 py-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {callProviders.map((item, itemIdx) => (
          <li key={itemIdx} className="flow-root">
            <div
              className="relative -m-2 p-2 flex items-center space-x-4 rounded-xl hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
              <div
                className={classNames(
                  item.background,
                  'flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-lg'
                )}
              >
                <item.icon className="h-6 w-6 text-white" aria-hidden="true"/>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  <a href="#" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true"/>
                    {item.title}
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const NewSession = React.memo(({mentorSession}) => {
  const {user, accessToken} = useContext(AuthContext)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [time, setTime] = React.useState(() => {
    return mentorSession.current_session_length
  });
  const [timerOn, setTimerOn] = React.useState(false);
  const {mutate} = useSWRConfig()

  useEffect(() => {
    let interval = null;

    if (timerOn) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!timerOn) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerOn]);

  useEffect(() => {
    function getSessionStatus() {
      // check if the session is currently paused or active
      const events = mentorSession.events
      if (events.length > 0) {
        const lastEvent = events[events.length - 1]
        if (!lastEvent.end_time) {
          setTimerOn(true)
        }
      }
    }

    getSessionStatus()
  }, [mentorSession])

  useEffect(() => {
    async function initialiseSocket() {
      await fetch(`/api/socket/${mentorSession.id}`);
      socket = io()
      socket.on("update-pause-session", (msg) => {
        if (msg.action === 'pause') {
          setTimerOn(false)
        } else {
          setTimerOn(true)
        }
      })
      socket.on("update-end-session", async () => {
        await mutate(`${API_URL}/api/sessions/${mentorSession.id}/`)
        setTimerOn(false)
      })
    }

    if (mentorSession) {
      initialiseSocket()
    }
    return () => {
      if (socket) {
        socket.emit('user-disconnect', {user});
        socket.off();
      }
    }
  }, [])

  async function startOrPauseSession() {
    try {
      const apiRes = await fetch(`${API_URL}/api/sessions/${mentorSession.id}/pause/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (apiRes.status === 200) {
        await apiRes.json();
        if (timerOn) {
          setTimerOn(false)
        } else {
          setTimerOn(true)
        }
        socket.emit('pause-session', {action: timerOn ? "pause" : "start"});
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function endSession() {
    try {
      const apiRes = await fetch(`${API_URL}/api/sessions/${mentorSession.id}/end/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (apiRes.status === 200) {
        const data = await apiRes.json();
        setTimerOn(false)
        setSessionEnded(true)
        socket.emit('end-session');
        await mutate(`${API_URL}/api/sessions/${mentorSession.id}/`, data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-5">
      {/* Left column */}
      <div className="col-span-2">
        {/* Chat */}
        <div>
          <div className="mt-2 rounded-lg bg-white overflow-hidden shadow">
            <div className="px-4 py-3">
              {mentorSession && (
                <ClientChatbox
                  user={user}
                  other={mentorSession.other_user}/>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-3">

        <div className="mt-2 px-4 sm:px-6 py-5 rounded-lg bg-white overflow-hidden shadow">
          <div style={{textAlign: 'center'}}>
            {mentorSession && (
              <div>
                {mentorSession.client_profile.username === user.username && (
                  <h3>You are the client</h3>
                )}
                {mentorSession.mentor_profile.username === user.username && (
                  <h3>You are the mentor</h3>
                )}
              </div>
            )}
            <div style={{fontSize: '100px'}}>
              {/*<span>{hours < 10 ? `0${hours}` : hours}</span>:<span>{minutes < 10 ? `0${minutes}` : minutes}</span>:<span>{seconds < 10 ? `0${seconds}` : seconds}</span>*/}
              <span>{("0" + Math.floor((time / 3600) % 60)).slice(-2)}:</span>
              <span>{("0" + Math.floor((time / 60) % 60)).slice(-2)}:</span>
              <span>{("0" + (time % 60)).slice(-2)}</span>
            </div>
            {sessionEnded && (
              <div>
                <h3>Your session has ended!</h3>
                <p>Please click here to <Link href={`/payment/${mentorSession.id}`}>
                  <a>
                    pay
                  </a>
                </Link> for the session</p>
              </div>
            )}
            {mentorSession.events.length > 0 || timerOn ? (
              <div>
                <button
                  type="button"
                  onClick={startOrPauseSession}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {timerOn ? "Pause" : "Resume"}
                  {timerOn ? (
                    <PauseIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true"/>
                  ) : (
                    <PlayIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true"/>
                  )}
                </button>
                <button
                  type="button"
                  onClick={endSession}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  End
                  <StopIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true"/>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startOrPauseSession}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start
                <PlayIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true"/>
              </button>
            )}
            <CallProviders/>
          </div>
        </div>

      </div>

    </div>
  )
})

function SessionPayment({mentorSession}) {
  const {user, accessToken} = useContext(AuthContext)
  const [requirePayment, setRequirePayment] = useState(false)

  useEffect(() => {
    // Only require payment from the client user
    setRequirePayment(mentorSession.client_profile.username === user.username)
  }, [mentorSession])

  async function createStripeCheckout() {
    try {
      const body = JSON.stringify({
        mentorSessionId: mentorSession.id
      })
      const apiRes = await fetch(`${API_URL}/api/stripe-checkout/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body
      });
      if (apiRes.status === 200) {
        const data = await apiRes.json();
        window.location.href = data.url
      }
    } catch (err) {
      console.error(err)
    }
  }

  function formatPrice(price) {
    return "$" + price / 100
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Payment</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Awaiting payment. You will receive a notification when the payment is made.
        </p>
      </div>

      <div className='py-5 text-gray-800'>
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div>
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Call Length</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span>{("0" + Math.floor((mentorSession.session_length / 3600) % 60)).slice(-2)}:</span>
                      <span>{("0" + Math.floor((mentorSession.session_length / 60) % 60)).slice(-2)}:</span>
                      <span>{("0" + (mentorSession.session_length % 60)).slice(-2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Amount</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(mentorSession.price)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}
                        className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {requirePayment && (
                        <div>
                          <button
                            className="mt-3 text-white text-lg bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md "
                            onClick={createStripeCheckout}>
                            Pay now
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function ReviewForm({mentorSession}) {
  const { accessToken } = useContext(AuthContext)
  const router = useRouter()
  const [review, setReview] = useState('')
  const [star, setStar] = useState(3)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const body = JSON.stringify({
        rating: star,
        description: review,
        session: mentorSession.id
      })
      const apiRes = await fetch(`${API_URL}/api/reviews/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body
      });
      if (apiRes.status === 201) {
        await apiRes.json();
        await router.push('/profile/u/session-history')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <div
        className="border border-gray-300 shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <label htmlFor="review" className="sr-only">
          Review
        </label>
        <textarea
          rows={2}
          name="review"
          id="review"
          className="mt-2 block w-full border-0 py-0 resize-none placeholder-gray-500 focus:ring-0 sm:text-sm"
          placeholder={`Share your experience with ${mentorSession.mentor_profile.full_name}...`}
          defaultValue={''}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        {/* Spacer element to match the height of the toolbar */}
        <div aria-hidden="true">
          <div className="py-2">
            <div className="h-9"/>
          </div>
          <div className="h-px"/>
          <div className="py-2">
            <div className="py-px">
              <div className="h-9"/>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-px">
        <div className="border-t border-gray-200 px-2 py-2 flex justify-between items-center space-x-3 sm:px-3">
          <div className="flex">
            <ul className="mt-1 flex justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <li key={i} onClick={() => setStar(i)} className="cursor-pointer">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                       className={classNames(
                         star >= i ? "text-yellow-500" : "text-gray-300",
                         "w-4 mr-1"
                       )} role="img" xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 576 512">
                    <path fill="currentColor"
                          d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/>
                  </svg>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}


function SessionReview({mentorSession}) {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Review</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Thank you for the session! Please consider leaving a review.
        </p>
      </div>
      <div className='py-5 text-gray-800'>
        <div className="flex flex-col">
          <ReviewForm mentorSession={mentorSession}/>
        </div>
      </div>
    </div>
  )
}

function Session() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null)
  const {user, accessToken, loading} = useContext(AuthContext)

  useEffect(() => {
    if (!router.isReady) return;
    const {query} = router
    setSessionId(query.sessionId)
  }, [router.isReady]);

  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }

  const {
    data: mentorSession,
    error
  } = useSWR((sessionId !== undefined && sessionId !== null) ? `${API_URL}/api/sessions/${sessionId}/` : null, fetcher)
  const {data: mentor} = useSWR(mentorSession && mentorSession.mentor_profile ? `${API_URL}/api/mentors/${mentorSession.mentor_profile.username}/` : null, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  if (error || mentorSession && mentorSession.code) {
    return "Error!"
  }

  if (!mentorSession) {
    return "Loading..."
  }

  if (mentorSession.reviewed) {
    <div className="flex flex-col flex-1">
      <main className="flex-1 pb-8">
        {mentor && <MentorProfileHeader mentor={mentor}/>}
        <div className="mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>Nothing to see here. This session is finished.</p>
          </div>
        </div>
      </main>
    </div>
  }

  if (mentorSession.paid) {
    return (
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          {mentor && <MentorProfileHeader mentor={mentor}/>}
          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {mentorSession.client_profile.username === user.username ? (
                <SessionReview mentorSession={mentorSession}/>
              ) : (
                <p>Nothing to see here. This session is finished.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (mentorSession.completed && !mentorSession.paid) {
    return (
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          {mentor && <MentorProfileHeader mentor={mentor}/>}
          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <SessionPayment mentorSession={mentorSession}/>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 pb-8">
        {mentor && <MentorProfileHeader mentor={mentor}/>}
        <div className="mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewSession mentorSession={mentorSession}/>
          </div>
        </div>
      </main>
    </div>
  );
}

function SessionPage({fallback}) {
  return (
    <SWRConfig value={{fallback}}>
      <Session/>
    </SWRConfig>
  )
}

export default SessionPage;

export async function getServerSideProps(context) {
  const {req, query} = context
  const {cookies} = req
  const {sessionId} = query
  const sessionAPI = `${API_URL}/api/sessions/${sessionId}/`;
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    }).then((res) => res.json());
  }
  const data = await fetcher(sessionAPI);
  return {
    props: {
      protected: true,
      fallback: {
        [sessionAPI]: data
      }
    },
  }

}
