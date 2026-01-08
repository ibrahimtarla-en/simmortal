package com.simmortal.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SupertokensAuthenticationFilter extends OncePerRequestFilter {
  private static final String USER_ID_HEADER = "X-User-Id";
  private final SupertokensSessionService sessionService;

  public SupertokensAuthenticationFilter(SupertokensSessionService sessionService) {
    this.sessionService = sessionService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {
    if (SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }
    Optional<String> userId = sessionService.verifySession(request);
    if (userId.isPresent()) {
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(userId.get(), "supertokens", List.of());
      SecurityContextHolder.getContext().setAuthentication(authentication);
      HttpServletRequest wrappedRequest = new UserIdHeaderRequest(request, userId.get());
      filterChain.doFilter(wrappedRequest, response);
      return;
    }
    filterChain.doFilter(request, response);
  }

  private static final class UserIdHeaderRequest extends HttpServletRequestWrapper {
    private final String userId;

    private UserIdHeaderRequest(HttpServletRequest request, String userId) {
      super(request);
      this.userId = userId;
    }

    @Override
    public String getHeader(String name) {
      if (USER_ID_HEADER.equalsIgnoreCase(name)) {
        return userId;
      }
      return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
      if (USER_ID_HEADER.equalsIgnoreCase(name)) {
        return Collections.enumeration(List.of(userId));
      }
      return super.getHeaders(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
      Set<String> names = new LinkedHashSet<>();
      Enumeration<String> original = super.getHeaderNames();
      while (original.hasMoreElements()) {
        names.add(original.nextElement());
      }
      names.add(USER_ID_HEADER);
      return Collections.enumeration(names);
    }
  }
}
