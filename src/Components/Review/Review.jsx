import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Review = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [appliedJob, setAppliedJob] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
      // Fetch user data from the database based on the logged-in user's email and job ID
      const fetchUserData = async () => {
          try {
              const userEmail = localStorage.getItem('userEmail');
              const response = await axios.get(`https://jobhub-connect1.netlify.app/.netlify/functions/main/api/getUserData?email=${userEmail}&job_id=${id}`);
              setUserData(response.data);
              console.log(response.data);
          } catch (error) {
              console.error('Error fetching user data:', error);
          }
      };

      // Fetch applied job details from local storage based on the job ID
      const fetchAppliedJob = () => {
          const userEmail = localStorage.getItem('userEmail');
          const storedJobs = JSON.parse(localStorage.getItem(`jobs_${userEmail}`)) || [];
          const job = storedJobs.find((job) => job.id == id);
          setAppliedJob(job);
          console.log(job);
      };

      // Fetch resume from the server based on the logged-in user's email and job ID
      const fetchResume = async () => {
        try {
          const userEmail = localStorage.getItem('userEmail');
          const response = await axios.get(`https://jobhub-connect1.netlify.app/.netlify/functions/main/api/getResume?email=${userEmail}&jobId=${id}`);
          setResume(response.data.resume_url);
        } catch (error) {
          console.error('Error fetching resume:', error);
        }
      };

      fetchUserData();
      fetchAppliedJob();
      fetchResume();
  }, [id]);

  if (!userData || !appliedJob) {
      return (
          <div className="flex items-center justify-center h-screen">
              <div className="text-2xl font-bold text-indigo-800">Loading...</div>
          </div>
      );
  }
  const downloadResume = (resumeUrl) => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = resumeUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-4xl font-bold mb-8 text-indigo-800">Review Details</h2>

      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <h3 className="text-3xl font-bold mb-6 text-indigo-800">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Name:</span> {userData.name}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Email:</span> {userData.email}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Phone:</span> {userData.phone}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Skills:</span> {userData.skills}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Gender:</span> {userData.gender}
            </p>
          </div>
          <div>
            {!userData.hasExperience && (
              <>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-indigo-800">Degree:</span> {userData.degree}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-indigo-800">College:</span> {userData.college}
                </p>
              </>
            )}
            {userData.hasExperience && (
              <>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-indigo-800">Previous Company:</span>{' '}
                  {userData.previousCompanyName}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-indigo-800">Previous CTC:</span> {userData.previousCTC}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-indigo-800">Expecting CTC:</span> {userData.expectingCTC}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <h3 className="text-3xl font-bold mb-6 text-indigo-800">Applied Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Job Title:</span> {appliedJob.job_title}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Company:</span> {appliedJob.company_name}
            </p>
          </div>
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Location:</span> {appliedJob.location}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold text-indigo-800">Salary:</span> {appliedJob.salary}
            </p>
          </div>
        </div>
      </div>

      {resume && (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h3 className="text-3xl font-bold mb-6 text-indigo-800">Resume</h3>
            <div className="mb-4">
              <span className="font-semibold text-indigo-800">Resume Name:</span>{' '}
              <span
                onClick={() => downloadResume(resume)}
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                {resume.split('?')[0].split('/').pop()}
              </span>
            </div>
            <div className="rounded-lg">
              <embed
                type="application/pdf"
                width="100%"
                height="0px"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default Review;