package com.codecool.eshipdiary.controller;

import com.codecool.MockAuthentication;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.BDDMockito;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.*;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Created by hamargyuri on 2017. 03. 19..
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(SecurityContextHolder.class)
@ContextConfiguration
public class HomeControllerTest {
    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private HomeController homeController;

    private MockMvc mockMvc;

    private HashSet<GrantedAuthority> authorities;

    private MockAuthentication authentication;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(homeController).build();

        PowerMockito.mockStatic(SecurityContextHolder.class);
        BDDMockito.given(SecurityContextHolder.getContext()).willReturn(securityContext);
        authorities = new HashSet<>();
    }

    @Test
    public void indexWithAdmin() throws Exception {
        authorities.add(new SimpleGrantedAuthority("ADMIN"));
        authentication = new MockAuthentication(authorities);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        mockMvc.perform(get("/")).andExpect(redirectedUrl("/users"));
    }

    @Test
    public void indexWithNotAdmin() throws Exception {
        authorities.add(new SimpleGrantedAuthority("USER"));
        authentication = new MockAuthentication(authorities);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        mockMvc.perform(get("/")).andExpect(forwardedUrl("index"));
    }
}