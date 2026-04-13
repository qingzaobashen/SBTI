/**
 * Supabase用户名/密码认证组件
 * 实现用户注册、登录、登出等功能
 */
import "../index.css";
import { useState, useEffect } from "react";
import { useUser } from '../context/UserContext';
import { message } from 'antd'; // 添加消息提示组件

// 导入共享的Supabase客户端实例
import supabase from '../utils/supabase';

// 组件样式
/**
 * 登录组件样式
 */
const styles = {
  // 容器样式
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '35px',
  },
  
  // 卡片样式
  loginCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    padding: '20px',
    width: '100%',
    maxWidth: '320px',
    transition: 'all 0.3s ease',
  },
  
  // 头部样式
  loginHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  
  // 标题样式
  loginTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'black', 
    marginBottom: '8px',
  },
  
  // 副标题样式
  loginSubtitle: {
    fontSize: '13px',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  
  // 表单组样式
  formGroup: {
    marginBottom: '15px',
  },
  
  // 标签样式
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: 'black', 
    marginBottom: '8px',
  },
  
  // 输入框样式
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'black',
  },
  
  // 输入框聚焦样式
  inputFocus: {
    borderColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.2)',
  },
  
  // 按钮样式
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#e7f6f6ff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '12px',
  },
  
  // 按钮悬停样式
  buttonHover: {
    backgroundColor: '#f0f0f0',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
  },
  
  // 按钮禁用样式
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
  
  // 错误信息样式
  error: {
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    color: 'black',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '13px',
    borderLeft: '4px solid white',
  },
  
  // 密码强度样式
  passwordStrength: {
    marginTop: '8px',
    fontSize: '12px',
  },
  
  // 强度条容器样式
  strengthBarContainer: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
  },
  
  // 强度条样式
  strengthBar: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    backgroundColor: '#cccccc',
  },
  
  // 模式切换样式
  switchMode: {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  
  // 切换按钮样式
  switchButton: {
    background: 'none',
    border: 'none',
    color: 'black', 
    cursor: 'pointer',
    fontWeight: '600',
    padding: '0 4px',
    transition: 'color 0.3s ease',
  },
  
  // 切换按钮悬停样式
  switchButtonHover: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'underline',
  },
  
  // 已登录容器样式
  loggedInContainer: {
    textAlign: 'center',
  },
  
  // 欢迎消息样式
  welcomeMessage: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'black', 
    marginBottom: '8px',
  },
  
  // 用户信息样式
  userInfo: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '15px',
  },
  
  // 登出按钮样式
  logoutButton: {
    backgroundColor: '#ef5350',
  },
  
  // 登出按钮悬停样式
  logoutButtonHover: {
    backgroundColor: '#e53935',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(239, 83, 80, 0.3)',
  }
};

export default function LoginBySupabaseUsername({ onSuccess }) {
  // 认证状态管理
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // 表单状态管理
  const [isRegister, setIsRegister] = useState(false); // 切换注册/登录模式
  const [isPasswordReset, setIsPasswordReset] = useState(false); // 切换密码重置模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // 记住登录状态
  const [passwordStrength, setPasswordStrength] = useState({}); // 密码强度状态
  const { sendPasswordResetEmail } = useUser(); // 从UserContext获取方法

  /**
   * 初始化时不再需要本地监听认证状态
   * 因为UserContext已经全局管理了认证状态
   */
  useEffect(() => {
    // 移除本地认证状态监听，统一由UserContext管理
  }, []);

  /**
   * 检测密码强度
   * @param {string} password - 要检测的密码
   * @returns {Object} 密码强度信息
   */
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    
    // 长度检查
    if (password.length >= 8) {
      score += 1;
      feedback.push('密码长度足够');
    } else {
      feedback.push('密码长度至少需要8位');
    }
    
    // 包含数字
    if (/\d/.test(password)) {
      score += 1;
      feedback.push('包含数字');
    } else {
      feedback.push('建议包含数字');
    }
    
    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push('包含小写字母');
    } else {
      feedback.push('建议包含小写字母');
    }
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push('包含大写字母');
    } else {
      feedback.push('建议包含大写字母');
    }
    
    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
      feedback.push('包含特殊字符');
    } else {
      feedback.push('建议包含特殊字符');
    }
    
    // 确定强度等级
    let strength = '弱';
    let color = '#dc3545'; // 红色
    
    if (score >= 4) {
      strength = '强';
      color = '#28a745'; // 绿色
    } else if (score >= 3) {
      strength = '中等';
      color = '#ffc107'; // 黄色
    }
    
    return {
      score,
      strength,
      color,
      feedback
    };
  };

  /**
   * 处理用户注册
   * @param {Event} event - 表单提交事件
   */
  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      //console.log("注册尝试:", { email, username });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // 存储用户名到用户元数据
            isPremium: false // 默认非VIP用户
          },
        },
      });

      if (error) {
        throw error;
      }

      // 注册成功，调用成功回调
      if (data.user) {
        onSuccess?.(data.user);
        //console.log("注册成功:", data.user);
        message.success('注册成功，验证邮件已发送，请检查邮箱后登录');
        setIsRegister(false); // 切换回登录模式
        // 清空表单
        setEmail('');
        setPassword('');
        setUsername('');
      }
    } catch (error) {
      console.error("注册失败:", error);
      // 提供更友好的错误提示
      let errorMessage = '注册失败，请稍后重试';
      if (error.code === 'email_already_exists') {
        errorMessage = '该邮箱已被注册，请使用其他邮箱';
      } else if (error.code === 'weak_password') {
        errorMessage = '密码强度不足，请使用更复杂的密码';
      } else if (error.code === 'network') {
        errorMessage = '网络连接失败，请检查网络后重试';
      }
      setAuthError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理用户登录
   * @param {Event} event - 表单提交事件
   */
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      //console.log("登录尝试:", { email, rememberMe });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // 设置会话持久化选项
          // 如果选择记住我，则使用持久会话
          // 否则使用会话级别的会话（关闭浏览器后过期）
          remember: rememberMe
        }
      });

      if (error) {
        throw error;
      }
      // 取消VIP的测试代码
      //const { datas, errors } = await supabase.auth.updateUser({
      //        data: { 
      //          isPremium: false,
      //          premium_expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 默认为1天有效期
      //        }
      //      });
      // 登录成功，调用成功回调
      if (data.session) {
        //console.log("登录成功:", data);
        // UserContext会自动通过onAuthStateChange监听登录状态
        onSuccess?.(data.user);
        message.success('登录成功');
      }
    } catch (error) {
      console.error("登录失败:", error);
      // 提供更友好的错误提示
      let errorMessage = '登录失败，请稍后重试';
      if (error.code === 'invalid_credentials') {
        errorMessage = '邮箱或密码错误，请检查后重试';
      } else if (error.code === 'user_not_confirmed') {
        errorMessage = '账号尚未验证，请先验证邮箱后登录';
      } else if (error.code === 'network') {
        errorMessage = '网络连接失败，请检查网络后重试';
      }
      setAuthError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理密码重置
   * @param {Event} event - 表单提交事件
   */
  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      //console.log("密码重置尝试:", { email });
      const success = await sendPasswordResetEmail(email);
      
      if (success) {
        // 重置成功后，切换回登录模式
        setIsPasswordReset(false);
        // 清空表单
        setEmail("");
        setPassword("");
        window.confirm("邮件已发送，请登录邮箱并点击链接重置密码");
      }
    } catch (error) {
      setAuthError(error.message);
      window.confirm(`密码重置失败: ${error.message}`);
      console.error("密码重置失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 渲染错误信息
   */
  const renderError = () => {
    if (!authError) return null;
    return (
      <div style={styles.error}>
        {authError}
      </div>
    );
  };

  /**
   * 渲染已登录状态  // 2025-12-16 暂无需渲染登录状态
   */
  //if (session) {
  //  return (
  //    <div style={styles.loginContainer}>
  //      <div style={{ ...styles.loginCard, ...styles.loggedInContainer }}>
  //        <h1 style={styles.welcomeMessage}>欢迎回来！</h1>
  //        <p style={styles.userInfo}>您已登录为: {session.user.email}</p>
  //        {session.user.user_metadata?.username && (
  //          <p style={styles.userInfo}>用户名: {session.user.user_metadata.username}</p>
  //        )}
  //        <button
  //          onClick={handleLogout}
  //          style={{ ...styles.button, ...styles.logoutButton }}
  //          onMouseEnter={(e) => e.target.style = { ...styles.button, ...styles.logoutButton, ...styles.logoutButtonHover }}
  //          onMouseLeave={(e) => e.target.style = { ...styles.button, ...styles.logoutButton }}
  //        >
  //          登出
  //        </button>
  //      </div>
  //    </div>
  //  );
  //}

  /**
   * 渲染登录/注册表单
   */
  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          {isPasswordReset ? (
            <>
              <h1 style={styles.loginTitle}>重置密码</h1>
              <p style={styles.loginSubtitle}>
                输入您的邮箱地址，我们将发送密码重置链接
              </p>
            </>
          ) : (
            <>
              <h1 style={styles.loginTitle}>{isRegister ? "创建账号" : "欢迎回来"}</h1>
              <p style={styles.loginSubtitle}>
                {isRegister ? "注册一个新账号开始使用我们的服务" : "登录您的账号继续使用"}
              </p>
            </>
          )}
        </div>

        {renderError()}

        {isPasswordReset ? (
          // 密码重置表单
          <form onSubmit={handlePasswordReset}>
            <div style={styles.formGroup}>
              <label style={styles.label}>电子邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                placeholder="请输入您的邮箱地址"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.button, styles.buttonHover)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.button)}
            >
              {loading ? "发送中..." : "发送重置邮件"}
            </button>
          </form>
        ) : isRegister ? (
          // 注册表单
          <form onSubmit={handleRegister}>
            <div style={styles.formGroup}>
              <label style={styles.label}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                placeholder="请输入用户名"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>电子邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                placeholder="请输入电子邮箱"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                  if (newPassword) {
                    setPasswordStrength(checkPasswordStrength(newPassword));
                  } else {
                    setPasswordStrength({});
                  }
                }}
                required
                minLength={8}
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                placeholder="请输入密码（至少8位）"
              />
              {password && (
                <div style={styles.passwordStrength}>
                  <div style={{ marginBottom: '4px' }}>
                    密码强度: <span style={{ color: passwordStrength.color }}>{passwordStrength.strength}</span>
                  </div>
                  <div style={styles.strengthBarContainer}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        style={{
                          ...styles.strengthBar,
                          backgroundColor: step <= passwordStrength.score ? passwordStrength.color : '#cccccc'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>
                    {passwordStrength.feedback?.slice(0, 3).map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.button, styles.buttonHover)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.button)}
            >
              {loading ? "注册中..." : "创建账号"}
            </button>
          </form>
        ) : (
          // 登录表单
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>电子邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                placeholder="请输入电子邮箱"
              />
            </div>

            <div style={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={styles.label}>密码</label>
                <button
                  type="button"
                  onClick={() => setIsPasswordReset(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0
                  }}
                >
                  忘记密码？
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                placeholder="请输入密码"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <label style={{ fontSize: '12px', color: '#666' }}>记住我</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.button, styles.buttonHover)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.button)}
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        )}

        {/* 切换登录/注册模式 */}
        <div style={styles.switchMode}>
          {isPasswordReset ? (
            <>
              想起密码了？
              <button
                onClick={() => setIsPasswordReset(false)}
                style={styles.switchButton}
                onMouseEnter={(e) => e.target.style = { ...styles.switchButton, ...styles.switchButtonHover }}
                onMouseLeave={(e) => e.target.style = styles.switchButton}
              >
                返回登录
              </button>
            </>
          ) : isRegister ? (
            <>
              已有账号？
              <button
                onClick={() => setIsRegister(false)}
                style={styles.switchButton}
                onMouseEnter={(e) => e.target.style = { ...styles.switchButton, ...styles.switchButtonHover }}
                onMouseLeave={(e) => e.target.style = styles.switchButton}
              >
                立即登录
              </button>
            </>
          ) : (
            <>
              还没有账号？
              <button
                onClick={() => setIsRegister(true)}
                style={styles.switchButton}
                onMouseEnter={(e) => e.target.style = { ...styles.switchButton, ...styles.switchButtonHover }}
                onMouseLeave={(e) => e.target.style = styles.switchButton}
              >
                立即注册
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
