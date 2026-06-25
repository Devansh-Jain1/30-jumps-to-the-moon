package com.jumps.moon.game;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class PlatformGenerator {

    private static final int CANVAS_WIDTH = 400;
    private static final int PLATFORM_COUNT = 30;
    private static final double Y_START = 550.0;
    private static final double Y_STEP = 18.0;
    private static final double MIN_WIDTH = 60.0;
    private static final double MAX_WIDTH = 120.0;
    private static final double MAX_HORIZONTAL_GAP = 200.0;

    public List<Platform> generate(long seed) {
        Random rng = new Random(seed);
        List<Platform> platforms = new ArrayList<>(PLATFORM_COUNT);

        double prevX = CANVAS_WIDTH / 2.0;
        double prevWidth = 80.0;

        for (int i = 1; i <= PLATFORM_COUNT; i++) {
            double y = Y_START + (i - 1) * Y_STEP;

            double width = MIN_WIDTH + rng.nextDouble() * (MAX_WIDTH - MIN_WIDTH);

            // Constrain x so the horizontal gap from the previous platform centre is <= MAX_HORIZONTAL_GAP
            double prevCentre = prevX + prevWidth / 2.0;
            double minX = Math.max(0, prevCentre - MAX_HORIZONTAL_GAP - width / 2.0);
            double maxX = Math.min(CANVAS_WIDTH - width, prevCentre + MAX_HORIZONTAL_GAP - width / 2.0);
            if (minX > maxX) {
                minX = Math.max(0, CANVAS_WIDTH - width);
                maxX = minX;
            }
            double x = minX + rng.nextDouble() * (maxX - minX);

            int stage;
            if (i <= 10) {
                stage = 1;
            } else if (i <= 20) {
                stage = 2;
            } else {
                stage = 3;
            }

            platforms.add(new Platform(i, x, y, width, stage));
            prevX = x;
            prevWidth = width;
        }

        return platforms;
    }
}
