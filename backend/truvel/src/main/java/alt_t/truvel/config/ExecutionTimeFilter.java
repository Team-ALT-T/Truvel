package alt_t.truvel.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class ExecutionTimeFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        long start = System.nanoTime();
        filterChain.doFilter(servletRequest, servletResponse);
        long end = System.nanoTime();

        long elapsedTime = end - start;
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        log.info("{} 실행시간 : {}", req.getRequestURI(), elapsedTime / 1_000_000.0 + "ms");
    }
}
