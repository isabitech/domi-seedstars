import React from "react";
import {
  Layout,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Card,
  Statistic,
  Divider,
  Carousel,
  Avatar 
} from "antd";
import {
  LoginOutlined,
  DollarOutlined,
  BankOutlined,
  CalculatorOutlined,
  RiseOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  PhoneOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import Hamburger from "../../pages/Hamburger";
import img1 from "../../assets/heroImg/hero1.png";
import img2 from "../../assets/heroImg/heroimg2.png";
import img3 from "../../assets/heroImg/heroimg3.png";
import man from '../../assets/testimonial/timg1.jpg'
import woman from '../../assets/testimonial/timg2.jpg'
import boy from '../../assets/testimonial/timg3.jpg'


const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: "32px", color: "#1890ff" }} />,
      title: "Daily Cashbook Management",
      description:
        "Comprehensive daily cashbook entry system with automated calculations for all branch operations.",
    },
    {
      icon: <BankOutlined style={{ fontSize: "32px", color: "#52c41a" }} />,
      title: "Bank Statement Integration",
      description:
        "Automated bank statement generation with real-time data synchronization from cashbook entries.",
    },
    {
      icon: <DollarOutlined style={{ fontSize: "32px", color: "#fa8c16" }} />,
      title: "Online Cash in Hand",
      description:
        "Real-time monitoring of cash positions with instant calculations and status indicators.",
    },
    {
      icon: <RiseOutlined style={{ fontSize: "32px", color: "#722ed1" }} />,
      title: "Prediction Analytics",
      description:
        "Smart prediction tools for tomorrow's disbursements to optimize cash flow and resource planning.",
    },
    {
      icon: (
        <CalculatorOutlined style={{ fontSize: "32px", color: "#eb2f96" }} />
      ),
      title: "Automated Calculations",
      description:
        "All financial calculations are automated including disbursement rolls and branch registers.",
    },
    {
      icon: <SafetyOutlined style={{ fontSize: "32px", color: "#13c2c2" }} />,
      title: "Role-based Security",
      description:
        "Secure access control with different permissions for Head Office and Branch users.",
    },
  ];
  const featureSlides = [
  features.slice(0, 3),
  features.slice(3, 6),
];


  const stats = [
    { title: "Branches Served", value: 50, prefix: <BankOutlined /> },
    { title: "Daily Transactions", value: 1250, prefix: <FileTextOutlined /> },
    { title: "Active Users", value: 200, prefix: <CheckCircleOutlined /> },
    { title: "Uptime", value: 99.9, suffix: "%", prefix: <SafetyOutlined /> },
  ];

  const heroSlides = [
    {
      image: img1,
      title: "Modern Financial Management",
      description:
        "Streamline your branch operations with our comprehensive financial management platform.",
      primaryCta: "Get Started",
      secondaryCta: "Learn More",
    },
    {
      image: img2,
      title: "Real-Time Cashbook Tracking",
      description:
        "Monitor cash inflow, outflow, and balances across all branches in real time.",
      primaryCta: "Explore Features",
      secondaryCta: "View Dashboard",
    },
    {
      image: img3,
      title: "Smart Analytics & Reports",
      description:
        "Make confident decisions using intelligent analytics and automated reports.",
      primaryCta: "View Analytics",
      secondaryCta: "See Reports",
    },
  ];
    const steps = [
    {
      step: "1",
      title: "Choose Loan Amount",
      text: "Select the amount that fits your needs and repayment plan.",
    },
    {
      step: "2",
      title: "Approved Your Loan",
      text: "Your application is reviewed and approved within minutes.",
    },
    {
      step: "3",
      title: "Get Your Cash",
      text: "Get your money in minutes simtibulm varius semnec mluctus gue lobortis faucibus..",
    },
  ];
  return (
    <Layout className="homepage-layout">
      {/* Header */}

      <Header className=" max-tablet:bg-white shadow-md w-full ">
        <div className="flex items-center justify-between max-tablet:hidden">
          <div className="text-[#1890ff] text-lg font-bold max-tablet:hidden ">
            Dominion Seedstars
          </div>

          <div className="max-tablet:hidden flex gap-5 items-center">
            {["Home", "Product", "Blog", "Features", "Docs"].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="hover:text-[#1890ff]"
              >
                {item}
              </a>
            ))}

            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={handleLogin}
            >
              Login
            </Button>

            <Button type="primary" size="large" onClick={handleLogin}>
              Sign up
            </Button>
          </div>
        </div>
        <Hamburger onLogin={handleLogin} />
      </Header>

      {/* Hero Section */}
      <Content>
        <Carousel autoplay autoplaySpeed={3000} speed={700} arrows dots>
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div className="hero-slide">
                <img src={slide.image} alt={slide.title} className="hero-img" />

                <div className="hero-overlay"></div>

                <div className="hero-text">
                  <Title level={1} className="text-white text-5xl mb-4">
                    {slide.title}
                  </Title>

                  <Paragraph className="text-white text-lg mb-6">
                    {slide.description}
                  </Paragraph>

                  <Space size="large">
                    <Button size="large" type="primary" onClick={handleLogin}>
                      {slide.primaryCta}
                    </Button>

                    <Button size="large" ghost onClick={() => {}}>
                      {slide.secondaryCta}
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
        {/* Statistics Section */}{" "}
        <div className="py-20 px-12 bg-gray-100">
          {" "}
          <Title level={2} className="text-center mb-12">
            {" "}
            Trusted by Financial Institutions{" "}
          </Title>{" "}
          <Row gutter={[32, 32]}>
            {" "}
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                {" "}
                <Card className="text-center border-none shadow-lg">
                  {" "}
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: "#1890ff" }}
                    className="text-2xl"
                  />{" "}
                </Card>{" "}
              </Col>
            ))}{" "}
          </Row>{" "}
        </div>{" "}
    {/* Features Section */}
<div className="py-20 px-12 bg-white">
  <Title level={2} className="text-center mb-12">
    Comprehensive Financial Solutions
  </Title>

  <Carousel
    autoplay
    autoplaySpeed={3000}
    dots={false}
    arrows={false}
    draggable={false}
    swipe={false}
    pauseOnHover={false}
    speed={800}
  >
    {featureSlides.map((slide, slideIndex) => (
      <div key={slideIndex} style={{ minHeight: '350px' }}>
        <Row gutter={[32, 32]}>
          {slide.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                className="h-full text-center border-none shadow-lg p-6"
              >
                <div className="mb-4">{feature.icon}</div>
                <Title level={4} className="mb-4">
                  {feature.title}
                </Title>
                <Paragraph type="secondary">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    ))}
  </Carousel>
</div>

{/* Steps Section */}
<div className="py-24 px-6 bg-white text-center">
  <Title level={2} className="mb-2">
    Fast & Easy Application Process
  </Title>
  <Paragraph className="max-w-2xl mx-auto text-gray-500 mb-16">
    Simple steps to get started and receive your funds quickly without stress.
  </Paragraph>

  <Row gutter={[32, 32]} className=" w-full mx-auto mt-20">
    {steps.map((item) => (
      <Col xs={24} md={8} key={item.step}>
        <Card className="relative border-none shadow-md pt-14 text-center hover:shadow-xl transition-shadow duration-300 ">
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2
                       w-12 h-12 rounded-full border-2 border-indigo-500
                       text-indigo-500 font-semibold flex items-center
                       justify-center bg-white"
          >
            {item.step}
          </div>

          <Title level={4} className="mb-3">{item.title}</Title>
          <Paragraph type="secondary">{item.text}</Paragraph>
        </Card>
      </Col>
    ))}
  </Row>

  <div className="mt-16">
    <Button type="primary" size="large">
      Start Today
    </Button>
  </div>
</div>
{/* Why People Choose Us Section */}
<div className="py-20 px-6 bg-gray-100 text-center">
  <Title level={2} className="mb-4">
    Why People Choose Us
  </Title>
    <Paragraph className="max-w-2xl mx-auto text-gray-500 mb-16">
    Quisque gravida, mi sit amet lacinia maximus, ulla rutrum tellus vel mauris
    tristique gravida odio lacus convallis est, vel pharetra leo massa ut sapien.
  </Paragraph>

  <div className=" flex w-full mx-auto max-mobile:flex-col">
    {[
      {
        icon: <BankOutlined style={{ fontSize: '48px', color: '#7c3aed' }} />,
        title: 'Dedicated Specialists',
        text: 'Duis eget diam quis elit erdiet alidvolutp terdum tfanissim non intwesollis eu mauris.',
        buttonText: 'Meet the team',
      },
      {
        icon: <RiseOutlined style={{ fontSize: '48px', color: '#7c3aed' }} />,
        title: 'Success Stories Rating',
        text: 'Integer facilisis fringilla dolor ut luctus lvinir felis miat velitliquam at lorem fermentum orci.',
        buttonText: 'View Client Review',
      },
      {
        icon: <CalculatorOutlined style={{ fontSize: '48px', color: '#7c3aed' }} />,
        title: 'No front Appraisal Fees!',
        text: 'Integer faisis fringilla dolor ut luctus nisi eneinrar felis viverra dignissim fermentum orci.',
        buttonText: 'Why choose us',
      },
    ].map((item, index) => (
      <div key={index} className="w-full ">
        <Card
          hoverable
          className="h-full text-center border-none shadow-lg p-8 flex flex-col justify-between"
        >
          <div className="mb-6">{item.icon}</div>
          <Title level={4} className="mb-3">
            {item.title}
          </Title>
          <Paragraph type="secondary" className="mb-6">
            {item.text}
          </Paragraph>
          <Button type="default" className="mt-auto border-indigo-500 text-indigo-500 hover:bg-indigo-50">
            {item.buttonText}
          </Button>
        </Card>
      </div>
    ))}
  </div>
</div>

<div className="py-30 px-6  bg-gray-900 text-center">
    <Title level={2} className="mb-4 !text-white !font-bold max-mobile:!text-lg ">
      Some of our Awesome Testimonials
  </Title>
    <p  className="max-w-2xl mx-auto mt-[-4px] text-gray-500 text-[17px] max-tablet:text-[15px]">
    You won’t be the only one lorem ipsu mauris diam mattises.
  </p>
   <div className=" flex w-full mx-auto mt-20 max-tablet:flex-col">
    {[
      {
        image: man ,
        text: '"I loved the customer service you guys provided me. That was very nice and patient with questions I had. I would really like definitely come back here"',
        title: "Donny J. Griffin",
        item:"Personal Loan",
      },
      {
        image: woman ,
        text: '“I had a good experience with Insight Loan Services. I am thankful to insight for the help you guys gave me. My loan was easy and fast. thank you Insigtht”',
        title: "Mary O. Randle",
        item:"Education Loan",
      },
      {
        image: boy ,
        text: '“We came out of their offices very happy with their service. They treated us very kind. Definite will come back. The waiting time was very appropriate.”',
        title: "Lindo E. Olson",
        item:"Car Loan",
      },
    ].map((item, index) => (
      <div key={index} className="w-full ">
        <div>
        <div
          className="h-full w-[87%] text-start border-none bg-white mx-auto p-8  flex flex-col justify-between rounded-lg ">
          <p className=" text-lg italic font-medium">
            {item.text}
          </p>
       
          </div>
            <div className="flex items-center gap-4 m-6 mx-7 max-tablet:mx-12 max-mobile:mx-6">
        <img
          src={item.image}
          className="w-14 h-14 rounded-2xl object-cover"
          alt={item.title}
        />

        <div className=" flex flex-col items-start">
          <h4 className="font-semibold text-white text-[17px]">{item.title}</h4>
          <p className="text-m text-gray-500">{item.item}</p>
        </div>
      </div>
        </div>
         
      </div>
    ))}
  </div>

</div>


{/* CTA Dark Section */}
<div className="relative py-30 px-12 overflow-hidden max-tablet:pb-10">
  <div className="absolute inset-0 from-indigo-600/20 via-purple-600/10 to-transparent" />

  <div className="relative max-w-6xl mx-auto">
    <Row align="middle" gutter={[32, 32]}>
      <Col xs={24} md={16}>
        <Title level={2} className="text-white mb-4 ">
          Ready to Transform Your Financial Operations?
        </Title>

        <Paragraph className="text-lg text-white/80 max-w-xl">
          Join thousands of financial professionals who trust our platform for
          daily cashbook management, analytics, and secure reporting.
        </Paragraph>
      </Col>

      <Col xs={24} md={8} className="md:text-right">
        <Space direction="vertical" size="large">
          <Button
            type="primary"
            size="large"
            className="h-12 px-10"
            onClick={handleLogin}
          >
            Start Your Journey
          </Button>

          <Text className="text-white/60">
            No credit card required
          </Text>
        </Space>
      </Col>
    </Row>
  </div>
</div>
     {/* contact us  */}
  <div className="py-20 px-6 bg-gray-100 text-center max-tablet:py-10">
  <Title level={2} className="mb-4">
    We are Here to Help You
  </Title>
    <Paragraph className="max-w-2xl mx-auto text-gray-500 mb-16">
    Quisque gravida, mi sit amet lacinia maximus, ulla rutrum tellus vel mauris
    tristique gravida odio lacus convallis est, vel pharetra leo massa ut sapien.
  </Paragraph>

  <div className=" flex w-full gap-7 mx-auto max-mobile:flex-col">
    {[
      {
        icon: <CalendarOutlined style={{ fontSize: '48px', color: '#7c3aed' }} />,
        title: 'Apply For Loan',
        text: 'Looking to buy a car or home loan? then apply for loan now.',
        Text: 'Get Appointment',
      },
      {
        icon: <PhoneOutlined style={{ fontSize: '48px', color: '#7c3aed' }} />,
        title: 'Call us at',
        text: 'lnfo@loanadvisor.com ',
        text2: ' 800-123-456 / 789',
        Text: 'Contact Us',
      },
      {
        icon: <UsergroupAddOutlined style={{ fontSize: '48px', color: '#7c3aed' }} />,
        title: 'Talk to Advisor',
        text: 'Need to loan advise? Talk to our Loan advisors.',
        Text: 'Meet the advisor',
      },
    ].map((item, index) => (
      <div key={index} className="w-full ">
        <Card
          hoverable
          className="h-full text-center border-none shadow-lg p-8  flex flex-col justify-between"
        >
          <div className="mb-6">{item.icon}</div>
          <Title level={4} className="mb-3">
            {item.title}
          </Title>
           <p className=" text-[19px] font-bold">
            {item.text2}
          </p>
          <p className="mb-6 text-[17px]">
            {item.text}
          </p>
         
          <Button type="default" className="mt-auto border-indigo-500 text-indigo-500 hover:bg-indigo-50">
            {item.Text}
          </Button>
        </Card>
      </div>
    ))}
  </div>
</div>   

      </Content>

      {/* Footer */}
      <div className=" pt-15 px-22  bg-gray-900 max-tablet:px-13 max-mobile:px-8 max-mobile:pt-10">
        <div className=" flex gap-50 items-center max-tablet:flex-col max-tablet:gap-10 max-tablet:items-start">
          <div className="text-[#1890ff] text-2xl  font-bold max-mobile:text-lg ">
            Dominion Seedstars
          </div>
          <div className=" flex gap-5 items-center max-mobile:flex-col max-mobile:items-start">
            <p className=" text-white font-bold text-[19px]">Have Questions!</p>
            <div >
            <input type="text"  placeholder="Write email address" className=" w-[430px] focus:outline-none focus:ring-0 bg-white p-3 max-mobile:w-[250px] "/>
            <button className=" h-12 !rounded text-white bg-blue-700 ">Go!</button>
            </div>
          </div>
         
        </div>
        <hr className=" text-gray-500 my-16 max-mobile:my-7" />
        <div className=" flex justify-between max-tablet:flex-col ">
          <div className=" w-[55%] text-gray-500 text-[17px] max-tablet:w-full max-tablet:mb-7  ">
            <p>Our goal at Borrow Loan Company is to provide access to personal loans and education loan, car loan, home loan at insight competitive interest rates lorem ipsums. We are the loan provider, you can use our loan product.</p>
            <div className=" flex gap-5 mt-10 w-[80%] max-mobile:flex-col  ">
            <div className=" flex gap-2 items-center w-[50%] max-mobile:w-[80%]">
            <EnvironmentOutlined style={{ fontSize: '30px', color: '#6B7280' }} />
            <p className="text-[16px] max-mobile:text-[14px]">3895 Sycamore Road Arlington, 97812</p>
            </div>
            <div className=" flex gap-2 items-center">
            <PhoneOutlined style={{ fontSize: '30px', color: '#6B7280' }} />
            <p>800-123-456</p>
            </div>
            </div>
          </div>
          <div className=" flex gap-49 max-tablet:flex max-mobile:gap-20 max-tablet:gap-40">
          <div className=" text-gray-500">
            <p>Home</p>
            <p>Services</p>
            <p>About us</p>
            <p>Faq</p>
            <p>News</p>
            <p>Contact us</p>
          </div>
          <div className=" text-gray-500">
            <p>Car loan</p>
            <p>Personal loan</p>
            <p>Educational loan</p>
            <p>Business loan</p>
            <p>Home loan</p>
            <p>Debt consolidation</p>
          </div>
          </div>
        </div>
        <div className=" flex justify-between mt-20 text-gray-500 max-mobile:flex-col max-mobile:gap-3">
          <p>© Copyright 2024 | Borrow Loan Company</p>
          <p>Terms of use | Privacy Policy</p>
        </div>
      </div>
    </Layout>
  );
};  