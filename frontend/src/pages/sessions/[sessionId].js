import {useRouter} from 'next/router';
import React, {useContext, useEffect, useState} from "react";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";
import Link from "next/link";
import {useStopwatch} from "react-timer-hook";
import useSWR, {SWRConfig} from "swr";
import {ClientChatbox} from "../../containers/ClientChatbox";


function NewSession({ mentorSession }) {
  const { user, accessToken } = useContext(AuthContext)
  const [sessionEnded, setSessionEnded] = useState(false)
  const fetcher = (url) => {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }).then((res) => res.json());
  }
  const { data: client } = useSWR(mentorSession && mentorSession.client_profile ? `${API_URL}/api/users/${mentorSession.client_profile.username}/`: null, fetcher)
  const { data: mentor } = useSWR(mentorSession && mentorSession.mentor_profile ? `${API_URL}/api/mentors/${mentorSession.mentor_profile.username}/`: null, fetcher)
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
  } = useStopwatch({ autoStart: false });

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
        if (isRunning) {
          pause()
        } else {
          start()
        }
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
        pause()
        setSessionEnded(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex">
      <div>
        {client && mentor && (
          <ClientChatbox
            user={user}
            other={mentorSession.other_user} />
        )}
      </div>
      <div>
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
            <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
          </div>
          <p>{isRunning ? 'Running' : 'Not running'}</p>
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
          {mentorSession.events.length > 0 ? (
            <div>
              <button onClick={startOrPauseSession}>{isRunning ? "Pause" : "Resume"}</button>
              <button onClick={endSession}>End</button>
            </div>
          ) : (
            <button onClick={startOrPauseSession}>Start</button>
          )}
        </div>
      </div>
    </div>
  )
}

function SessionReview({ mentorSession }) {
  return (
    <div className='container-fluid py-3'>
      <h1 className='display-5 fw-bold'>
        Review
      </h1>
      <div className='fs-4 mt-3'>
        Thanks for paying for the session: {mentorSession.id}
      </div>
    </div>
  )
}

function Session() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null)
  const {user, accessToken, loading} = useContext(AuthContext)

  useEffect(()=>{
    if(!router.isReady) return;
    const { query } = router
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

  const { data: mentorSession, error } = useSWR((sessionId !== undefined && sessionId !== null) ? `${API_URL}/api/sessions/${sessionId}/` : null, fetcher)
  const { data: client } = useSWR(mentorSession && mentorSession.client_profile ? `${API_URL}/api/users/${mentorSession.client_profile.username}/`: null, fetcher)
  const { data: mentor } = useSWR(mentorSession && mentorSession.mentor_profile ? `${API_URL}/api/mentors/${mentorSession.mentor_profile.username}/`: null, fetcher)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  if (error || mentorSession && mentorSession.code) {
    return "Error!"
  }

  if (!mentorSession) {
    return "Loading..."
  }

  if (mentorSession.completed) {
    return <SessionReview mentorSession={mentorSession} />
  }

  return (
    <div className='p-5 bg-light rounded-3'>
      <NewSession mentorSession={mentorSession} />
    </div>
  );
}

function SessionPage({ fallback }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Session />
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
