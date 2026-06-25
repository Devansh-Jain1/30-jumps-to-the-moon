package com.jumps.moon.game;

import java.util.List;

public record GameStateResponse(long seed, List<Platform> platforms) {}
