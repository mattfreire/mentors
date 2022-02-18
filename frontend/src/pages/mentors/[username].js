import {useRouter} from 'next/router';
import {useContext, useEffect, useState} from "react";
import {API_URL} from "../../config";
import {AuthContext} from "../../contexts/AuthContext";

const MentorDetail = ({mentor, accessToken}) => {
  const router = useRouter();
  const {username} = router.query
  const {user, loading} = useContext(AuthContext)
  const [sessionTime, setSessionTime] = useState(null)
  const [mentorSession, setMentorSession] = useState(null)

  if (typeof window !== 'undefined' && !user && !loading)
    router.push('/login');

  useEffect(() => {
    setInterval(() => {
      if (mentorSession) {
        const dateNow = new Date()
        const timeNow = dateNow.getTime()

        const startTimeDate = new Date(mentorSession.start_time)
        const startTime = startTimeDate.getTime()

        const timeSinceStart = (timeNow - startTime) / 1000
        setSessionTime(timeSinceStart)
      }

    }, 1000)
  }, [mentorSession])

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
        console.log(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function endSession() {}

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
        {mentorSession ? (
          <div>
            <p>Session has been going on for: {sessionTime} seconds</p>
            <button onClick={pauseSession}>Pause Session</button>
            <button onClick={endSession}>End Session</button>
          </div>
        ) : (
          <button onClick={createSession}>Start Session</button>
        )}
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
