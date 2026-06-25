package com.jumps.moon.game;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PlatformGeneratorTest {

    @Autowired
    private PlatformGenerator platformGenerator;

    @Test
    void testExactly30Platforms() {
        List<Platform> platforms = platformGenerator.generate(42L);
        assertEquals(30, platforms.size());
    }

    @Test
    void testStageAssignment() {
        List<Platform> platforms = platformGenerator.generate(42L);
        for (int i = 0; i < 10; i++) {
            assertEquals(1, platforms.get(i).stage(),
                    "Platform index " + (i + 1) + " should be stage 1");
        }
        for (int i = 10; i < 20; i++) {
            assertEquals(2, platforms.get(i).stage(),
                    "Platform index " + (i + 1) + " should be stage 2");
        }
        for (int i = 20; i < 30; i++) {
            assertEquals(3, platforms.get(i).stage(),
                    "Platform index " + (i + 1) + " should be stage 3");
        }
    }

    @Test
    void testSeedDeterminism() {
        List<Platform> first = platformGenerator.generate(99L);
        List<Platform> second = platformGenerator.generate(99L);
        assertEquals(first.size(), second.size());
        for (int i = 0; i < first.size(); i++) {
            assertEquals(first.get(i).x(), second.get(i).x(),
                    "X must be identical for same seed at index " + i);
            assertEquals(first.get(i).y(), second.get(i).y(),
                    "Y must be identical for same seed at index " + i);
        }
    }

    @Test
    void testAscendingY() {
        List<Platform> platforms = platformGenerator.generate(42L);
        for (int i = 1; i < platforms.size(); i++) {
            assertTrue(platforms.get(i).y() > platforms.get(i - 1).y(),
                    "Platform " + (i + 1) + " y should be greater than platform " + i + " y");
        }
    }
}
