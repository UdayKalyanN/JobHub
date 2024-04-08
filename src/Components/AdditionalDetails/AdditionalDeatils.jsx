import React, { useState,useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const AdditionalDetails = () => {
    const { id } = useParams();
    const details = JSON.parse(decodeURIComponent(id));
    const item=details
    console.log(item)
    //console.log(id.id)
    const [taskCompleted, setTaskCompleted] = useState(false);
    const [formData, setFormData] = useState({
        Name: '',
        Email: '',
        YOE: '',
        PCN: '',
        ECTC: ''
    });

    const handleChange = (e) => {
        console.log(e.target.name, e.target.value)
        setFormData({ ...formData, [e.target.name]: e.target.value });  
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
        localStorage.setItem("additionalDetails", JSON.stringify(formData));

        e.preventDefault()
      console.log("nanda anumolu")
      //console.log(email,password)
      const fd = new FormData();
    fd.append("Name", formData.Name);
    fd.append("Email",formData.Email);
    fd.append("PCN", formData.PCN);
    fd.append("ECTC",formData.ECTC);
    fd.append("YOE", formData.YOE);

    const urls = `http://127.0.0.1:8000/updateAdditionalDetails`;
    const postData = await fetch(urls, {
      method: "POST",
      body: fd,
    });
    const res = await postData.text();
    const data1 = JSON.parse(res);
    console.log(data1)
    if(data1.message==="User created successfully"){
      //window.location.href = '/'
    

        let newJob = {};
        let prevJob = JSON.parse(localStorage.getItem('jobs'));

        let searchedJob = prevJob?.find((data) => data.id == item.id);
        if (!searchedJob) {
            if (!prevJob) {
                newJob = [item];
                localStorage.setItem("jobs", JSON.stringify(newJob));
                toast.success('Successfully applied');
            } else {
                newJob = [...prevJob, item];
                localStorage.setItem("jobs", JSON.stringify(newJob));
                toast.success('Successfully applied');
            }
        } else {
            toast.error('Already applied');
        }
        setTaskCompleted(true)
    }
    };
    useEffect(() => {
        if (taskCompleted) {
            // Set timeout to redirect after 5 seconds (5000 milliseconds)
            const timeoutId = setTimeout(() => {
                // Redirect to the desired URL
                window.location.href = '/home';
            }, 1000); // 5000 milliseconds = 5 seconds

            // Clean up the timeout on component unmount to avoid memory leaks
        }
    }, [taskCompleted]);

    return (
        <div className="text-center my-6">
            <h1 className="text-5xl custom-text p-4">Review Your Details Before Submitting</h1>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                />
                <input
                    type="text"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                />
                <input
                    type="text"
                    name="YOE"
                    value={formData.YOE}
                    onChange={handleChange}
                    placeholder="Years of Experience"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                />
                <input
                    type="text"
                    name="PCN"
                    value={formData.PCN}
                    onChange={handleChange}
                    placeholder="Previous Company Name"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                />
                <input
                    type="text"
                    name="ECTC"
                    value={formData.ECTC}
                    onChange={handleChange}
                    placeholder="Expecting CTC"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                />
                <button type="submit" className="custom-btn mt-2">
                    Submit
                </button>
            </form>
            <Toaster />
        </div>
    );
};

export default AdditionalDetails;
