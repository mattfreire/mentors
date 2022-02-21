import {useRouter} from 'next/router';
import {useContext, useState} from "react";
import { useStopwatch } from 'react-timer-hook';
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";
import Link from "next/link";

const MentorDetail = ({mentor, accessToken}) => {
  const router = useRouter();
  const {username} = router.query
  const {user, loading} = useContext(AuthContext)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [mentorSession, setMentorSession] = useState(null)
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
  } = useStopwatch({ autoStart: false });

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  async function createSession() {
    try {
      const date = new Date()
      const startTime = date.toTimeString()
      const body = {
        start_time: startTime,
        mentor: mentor.id
      }
      const apiRes = await fetch(`${API_URL}/api/sessions/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body)
      });
      if (apiRes.status === 201) {
        const data = await apiRes.json();
        start()
        setMentorSession(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function pauseSession() {
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
        const data = await apiRes.json();
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
    <div className='p-5 bg-light rounded-3'>
      <div className='container-fluid py-3'>
        <h1 className='display-5 fw-bold'>
          Mentor Profile
        </h1>
        <div className='fs-4 mt-3'>
          {username}{" "}
          {mentor.is_active ? "Active" : "Inactive"}
        </div>
        <div style={{textAlign: 'center'}}>
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
          {mentorSession ? (
            <div>
              <button onClick={pauseSession}>{isRunning ? "Pause" : "Resume"}</button>
              <button onClick={endSession}>End</button>
            </div>
          ) : (
            <button onClick={createSession}>Start</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetail;

export async function getServerSideProps(context) {
  const {req, query} = context
  const {cookies} = req
  const {username} = query
  let data = []
  try {
    const apiRes = await fetch(`${API_URL}/api/mentors/${username}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.access}`,
      }
    });
    if (apiRes.status === 200) {
      data = await apiRes.json();
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      mentor: data,
      protected: true,
      accessToken: cookies.access
    },
  }
}
