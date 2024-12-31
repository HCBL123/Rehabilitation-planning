import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  LineChart, 
  Users, 
  Camera, 
  Shield, 
  ChevronRight,
  Menu,
  X,
  Play,
  ArrowRight,
  Check
} from 'lucide-react';
import { auth } from '../config/firebase';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartTrial = () => {
    window.location.href = '/register';
  };

  const handleWatchDemo = () => {
    console.log('Opening demo video...');
  };

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-blue-600" />,
      title: "Theo Dõi Tư Thế Thời Gian Thực",
      description: "Phân tích chuyển động chính xác bằng AI để hướng dẫn và đánh giá tư thế",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      title: "Điều Chỉnh Bài Tập Thông Minh",
      description: "Chương trình tập luyện được cá nhân hóa thích ứng với tiến độ và khả năng của bạn",
      bgColor: "bg-purple-50"
    },
    {
      icon: <LineChart className="w-6 h-6 text-green-600" />,
      title: "Phân Tích Tiến Độ",
      description: "Theo dõi tiến độ toàn diện với các chỉ số hiệu suất chi tiết",
      bgColor: "bg-green-50"
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "An Toàn & Riêng Tư",
      description: "Nền tảng tuân thủ HIPAA đảm bảo dữ liệu y tế của bạn được bảo vệ",
      bgColor: "bg-red-50"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Thiết Lập Hồ Sơ",
      description: "Tạo tài khoản và cho chúng tôi biết về nhu cầu phục hồi của bạn",
      icon: <Users className="w-8 h-8 text-blue-600" />
    },
    {
      step: "2",
      title: "Làm Theo Bài Tập Hướng Dẫn",
      description: "Nhận phản hồi thời gian thực khi thực hiện các bài tập được chỉ định",
      icon: <Activity className="w-8 h-8 text-blue-600" />
    },
    {
      step: "3",
      title: "Theo Dõi Tiến Độ",
      description: "Giám sát sự cải thiện với báo cáo và phân tích chi tiết",
      icon: <LineChart className="w-8 h-8 text-blue-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <span className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-blue-600' : 'text-white'
              }`}>MedRehab</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {['Tính Năng', 'Cách Hoạt Động', 'Đánh Giá'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className={`transition-colors duration-300 ${
                    isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white hover:text-blue-200'
                  }`}
                >
                  {item}
                </a>
              ))}
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Bắt Đầu Ngay
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`text-${isScrolled ? 'gray-600' : 'white'} hover:text-blue-600`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-8">
            <span className="block">Chuyển Đổi Quá Trình Phục Hồi</span>
            <span className="block text-blue-200 mt-2">Với Hướng Dẫn Từ AI</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-xl text-gray-200 sm:text-2xl md:mt-5 md:max-w-3xl">
            Trải nghiệm tương lai của phục hồi chức năng với phản hồi thời gian thực và hướng dẫn cá nhân hóa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleStartTrial}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              Dùng Thử Miễn Phí
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button 
              onClick={handleWatchDemo}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              Xem Demo
              <Play className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-2 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Advanced Features for Better Recovery
            </h2>
            <p className="text-xl text-gray-600">
              Our platform combines cutting-edge technology with medical expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`${feature.bgColor} rounded-xl p-8 h-full transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started with your rehabilitation journey in three simple steps
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-200 transform -translate-y-1/2 hidden md:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="bg-white rounded-xl shadow-lg p-8 transform group-hover:scale-105 transition-all duration-300">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto transform group-hover:rotate-12 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="w-full lg:w-2/3">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to start your recovery?</span>
                <span className="block text-blue-200 mt-2">Get started with our free trial today.</span>
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Join thousands of patients who have already transformed their rehabilitation journey.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <button 
                onClick={handleGetStarted}
                className="w-full lg:w-auto px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Sản Phẩm', 'Hỗ Trợ', 'Công Ty', 'Pháp Lý'].map((section) => (
              <div key={section}>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  {section}
                </h3>
                <ul className="mt-4 space-y-4">
                  {['Tính Năng', 'Tài Liệu'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2024 MedRehab. Đã đăng ký bản quyền.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;