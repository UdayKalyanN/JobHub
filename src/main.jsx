import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Home from "./Components/Home/Home";
import ErrorPage from "./Components/ErrorPage/ErrorPage";
import Statistic from "./Components/Statistic/Statistic";
import SimplePieChart from "./Components/Statistic/pie";
import AppliedJobs from "./Components/AppliedJobs/AppliedJobs";
import Login from "./Components/Register/Login";
import JobSection from "./Components/JobSection/JobSection2";
import Register from "./Components/Register/Register";
import Blog from "./Components/Blog/Blog";
import App from "./App";
import JobDetails from "./Components/JobDetails/JobDetails";
import AdditionalDetails from "./Components/AdditionalDetails/AdditionalDeatils";
import UploadResume from "./Components/AdditionalDetails/UploadResume";


const router = createBrowserRouter([
  {
    path:"/",
    element:<Login/>
  },
  {
    path:"registerPage",
    element:<Register/>,
  },
  {
    path: "/",
    element: <App/>,
    errorElement: <ErrorPage />,
    children: [
      // {
      //   path: "/",
      //   element: <Login />,
      //   //loader: () => fetch('/category.json'),
      // },
      {
        path: "/allJobs",
        element: <JobSection/>,
      },
      {
        path: "/additionalDetails/:id",
        element: <AdditionalDetails/>,
      },
      {
        path: "/uploadResume/:id",
        element: <UploadResume />,
      },
      {
        path: "/appliedjobs",
        element: <AppliedJobs/>,
      },
      {
        path:"/home",
        element:<Home/>,
        loader: () => fetch('/category.json'),
      },
      {
        path: "details",
        element: <JobDetails/>,
      },
      {
        path: "details/:id",
        element: <JobDetails />,
      loader: () => fetch('/company.json'),
        // loader: ({ params }) => fetch(`company.json/${params.id}`),
      },
      {
        path: "faq",
        element: <Blog />,
      },
      {
        path: "stat",
        element: <Statistic />,
      },
      {
        path: "pie",
        element:<SimplePieChart />,
      },
    ],
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);