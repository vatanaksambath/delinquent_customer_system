import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function WorkflowRulesScreen() {
  const [buckets, setBuckets] = useState<
    { id: string; name: string; max: number | null }[]
  >([
    { id: "1", name: "Grace Period", max: 14 },
    { id: "2", name: "Early-Stage", max: 30 },
    { id: "3", name: "Mid-Stage", max: 90 },
    { id: "4", name: "Late-Stage", max: null },
  ]);

  const handleAddBucket = () => {
    const newBuckets = [...buckets];
    const lastBucket = newBuckets.pop()!;
    const prevMax =
      newBuckets.length > 0 ? newBuckets[newBuckets.length - 1].max || 0 : 0;

    newBuckets.push({
      id: Date.now().toString(),
      name: "New Stage",
      max: prevMax + 30,
    });
    newBuckets.push(lastBucket);
    setBuckets(newBuckets);
  };

  const updateBucketMax = (index: number, newMax: number) => {
    const newBuckets = [...buckets];
    newBuckets[index].max = newMax;
    setBuckets(newBuckets);
  };

  const updateBucketName = (index: number, newName: string) => {
    const newBuckets = [...buckets];
    newBuckets[index].name = newName;
    setBuckets(newBuckets);
  };

  const deleteBucket = (index: number) => {
    const newBuckets = [...buckets];
    newBuckets.splice(index, 1);
    setBuckets(newBuckets);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background overflow-y-auto px-8 py-6 gap-8 pb-20"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight mb-2">
            Workflow Rules & Governance
          </h1>
          <p className="text-muted-foreground text-sm">
            Establish legal parameters, automated bucketing thresholds, and
            contact boundaries.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 shadow-md">
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bucket Adjuster Form */}
        <div className="modern-card border border-border bg-card  shadow-sm">
          <div className="p-4 border-b border-border bg-muted rounded-t-[1.3rem] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  account_tree
                </span>
                Delinquency Stage Buckets
              </h2>
              <p className="text-[10px] text-muted-foreground mt-1">
                Define logic boundaries based on Days Past Due (DPD) to drive
                automation.
              </p>
            </div>
            <button
              onClick={handleAddBucket}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {buckets.map((bucket, index) => {
                const min = index === 0 ? 1 : (buckets[index - 1].max || 0) + 1;
                const isLast = bucket.max === null;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    key={bucket.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="w-32 sm:w-40 mr-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={bucket.name}
                        onChange={(e) =>
                          updateBucketName(index, e.target.value)
                        }
                        className={`text-xs font-bold px-2 py-1 rounded w-full border outline-none ${
                          index === 0
                            ? "bg-muted  border-transparent"
                            : index === 1
                              ? "bg-accent/10 border-transparent text-accent"
                              : isLast
                                ? "bg-error text-primary-foreground border-transparent shadow-sm"
                                : "bg-error/10 text-error border-error/50 focus:border-error"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">
                          Min
                        </span>
                        <input
                          type="number"
                          value={min}
                          readOnly
                          className="w-12 sm:w-16 bg-card  border border-border rounded p-1 text-center font-mono font-bold text-xs sm:text-sm bg-opacity-50 text-muted-foreground outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">
                          Max
                        </span>
                        {isLast ? (
                          <input
                            type="text"
                            value="999+"
                            readOnly
                            className="w-12 sm:w-16 bg-card  border border-border rounded p-1 text-center font-mono font-bold text-xs sm:text-sm bg-opacity-50 text-muted-foreground outline-none"
                          />
                        ) : (
                          <input
                            type="number"
                            value={bucket.max || 0}
                            onChange={(e) =>
                              updateBucketMax(
                                index,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-12 sm:w-16 bg-card  border border-border rounded p-1 text-center font-mono font-bold text-xs sm:text-sm text-primary focus:border-primary outline-none transition-colors"
                          />
                        )}
                      </div>
                    </div>
                    <div className="w-8 ml-2 flex justify-end">
                      {!isLast && index !== 0 && (
                        <button
                          onClick={() => deleteBucket(index)}
                          className="text-error/30 hover:text-error hover:bg-error/10 rounded-md transition-all flex items-center justify-center p-1.5"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Contact Governance Constraints */}
        <div className="modern-card border border-border bg-card  shadow-sm h-fit">
          <div className="p-4 border-b border-border bg-muted rounded-t-[1.3rem]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">
                admin_panel_settings
              </span>
              Contact Governance
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1">
              Configure compliance constraints for outbound omnichannel
              communications.
            </p>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Toggle 1 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Block Evening Outreach
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Halt automated SMS and calls between 8 PM and 8 AM based on
                  borrower's local timezone (TCPA Compliance).
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-primary/50 transition-colors"></div>
                <div className="absolute top-1 left-1 bg-card w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </div>
            </label>

            <div className="h-[1px] bg-outline/10 w-full" />

            {/* Input 1 */}
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Maximum Weekly Touchpoints
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Limit total outbound actions (Voice + SMS + Email) per account
                  per calendar week.
                </p>
              </div>
              <input
                type="number"
                defaultValue={7}
                className="w-20 bg-card  border border-border rounded-lg p-2 text-center font-bold text-primary focus:border-primary outline-none"
              />
            </div>

            <div className="h-[1px] bg-outline/10 w-full" />

            {/* Toggle 2 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Cease & Desist Auto-Pause
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Automatically pause all logic flows if account is flagged for
                  C&D or Legal Action.
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-success transition-colors"></div>
                <div className="absolute top-1 left-1 bg-card w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
