"use client";

const AboutUs = () => {
  return (
    <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">About Agent Surface</h1>

      <p className="mb-4">
        <strong>Agent Surface</strong> is a digital platform designed to connect
        students, education agents, and colleges/universities through a secure,
        transparent, and efficient workflow. Our goal is to simplify the
        international education process by bringing all stakeholders into one
        centralized system.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">Who We Are</h2>
      <p className="mb-4">
        We are a technology-driven platform focused on improving how student
        applications are managed, tracked, and processed. By combining smart
        systems with structured workflows, Agent Surface helps reduce delays,
        miscommunication, and manual errors in the admission journey.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">What We Do</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Connect students with verified education agents and institutions</li>
        <li>Provide a centralized dashboard for application tracking</li>
        <li>Enable secure document and data management</li>
        <li>Support transparent communication between all parties</li>
        <li>Offer insights and reporting for better decision-making</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">Who We Serve</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          <strong>Students</strong> – To track applications and stay informed at
          every step
        </li>
        <li>
          <strong>Agents</strong> – To manage leads, applications, and
          communication efficiently
        </li>
        <li>
          <strong>Colleges & Universities</strong> – To receive organized,
          verified applications and performance insights
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">Our Values</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          <strong>Transparency</strong> – Clear processes and visible progress
        </li>
        <li>
          <strong>Security</strong> – Responsible handling of user data
        </li>
        <li>
          <strong>Efficiency</strong> – Faster workflows with fewer errors
        </li>
        <li>
          <strong>Trust</strong> – Building reliable relationships between all
          stakeholders
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">Our Mission</h2>
      <p className="mb-4">
        Our mission is to modernize the education recruitment ecosystem by
        replacing fragmented systems with a unified, reliable, and scalable
        platform that benefits students, agents, and institutions alike.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">Our Vision</h2>
      <p className="mb-4">
        We envision a future where international education processes are simple,
        transparent, and accessible—powered by technology that puts trust and
        clarity first.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">Contact Us</h2>
      <p className="mb-2">
        If you’d like to learn more about Agent Surface or collaborate with us,
        feel free to reach out:
        <br />
        <strong>Agent Surface</strong>
        <br />
        Email:{" "}
        <a
          href="mailto:agentsurface@gmail.com"
          className="text-blue-600 underline"
        >
          agentsurface@gmail.com
        </a>
      </p>
    </section>
  );
};

export default AboutUs;
